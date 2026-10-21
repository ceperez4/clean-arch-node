import * as fs from 'fs';
import * as path from 'path';
import { Pool, PoolConnection, RowDataPacket, createPool } from 'mysql2/promise';
import { get } from 'env-var';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envPath);
}

export async function run() {
  const pool = createPool({
    host: get('DB_HOST').default('localhost').required().asString(),
    port: get('DB_PORT').default(3306).asPortNumber(),
    user: get('DB_USER').default('root').required().asString(),
    password: get('DB_PASS').default('').asString(),
    database: get('DB_NAME').default('bdd_name').required().asString(),
    multipleStatements: true, // Requerido para scripts SQL con varias sentencias
    waitForConnections: true,
    connectionLimit: 2,
  });

  const migrator = new DatabaseMigrator(pool);

  try {
    await migrator.run();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error fatal durante la migración:', error);
    await pool.end();
    process.exit(1);
  }
}

interface LockRow extends RowDataPacket {
  acquired: number | null;
}

interface MigrationRow extends RowDataPacket {
  name: string;
}

export class DatabaseMigrator {
  private readonly lockName = 'app_schema_migration_lock';
  private readonly lockTimeoutSeconds = 30;

  constructor(private readonly pool: Pool) {}

  async run(): Promise<void> {
    const connection: PoolConnection = await this.pool.getConnection();
    let lockAcquired = false;

    try {
      
      console.log('Esperando bloqueo de migraciones...');
      const [lockResult] = await connection.query<LockRow[]>(
        'SELECT GET_LOCK(?, ?) AS acquired',
        [this.lockName, this.lockTimeoutSeconds],
      );

      lockAcquired = lockResult[0]?.acquired === 1;
      if (!lockAcquired) {
        throw new Error(
          `No se pudo adquirir el lock de migraciones tras ${this.lockTimeoutSeconds}s. Hay otra ejecución en curso.`,
        );
      }

      console.log('Bloqueo adquirido. Verificando estado del esquema...');

      await connection.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      const [rows] = await connection.query<MigrationRow[]>(
        'SELECT name FROM schema_migrations',
      );
      const applied = new Set(rows.map((r) => r.name));

      const migrationsDir = path.resolve(__dirname, '../../migrations');
      if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
      }

      const files = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith('.sql'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      const pending = files.filter((file) => !applied.has(file));

      if (pending.length === 0) {
        console.log('Base de datos al día. No hay migraciones pendientes.');
        return;
      }

      for (const file of pending) {
        console.log(`Aplicando migración: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8').trim();

        if (sql.length > 0) {
          await connection.query(sql);
        }

        await connection.query(
          'INSERT INTO schema_migrations (name) VALUES (?)',
          [file],
        );
        console.log(`✓ Aplicada: ${file}`);
      }

      console.log('Todas las migraciones se completaron con éxito.');
    } finally {
      if (lockAcquired) {
        try {
          await connection.query('SELECT RELEASE_LOCK(?)', [this.lockName]);
        } catch (err) {
          console.error('Error al liberar lock de MySQL:', err);
        }
      }
      connection.release();
    }
  }
}