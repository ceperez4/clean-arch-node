<div align="center">

# 🏛️ Clean Architecture & DDD Boilerplate with NestJS

[![NestJS](https://img.shields.io/badge/NestJS-12.x-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?logo=swagger&logoColor=black)](http://localhost:3000/docs)
[![pnpm](https://img.shields.io/badge/Maintained%20with-pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

**Boilerplate backend empresarial y proyecto de portafolio diseñado con los principios de Arquitectura Limpia (Clean Architecture), Diseño Guiado por el Dominio (DDD) y CQRS sobre NestJS.**

Ofrece una base sólida, desacoplada, testeable y lista para producción con autenticación JWT robusta (rotación y cookies seguras), **Autenticación en Dos Pasos (2FA/MFA) por correo electrónico**, control de versiones de tokens, lista negra, carga segura de archivos con rollback transaccional, sistema de migraciones nativo con bloqueos distribuidos y documentación OpenAPI Swagger interactiva.

</div>

---

## 📑 Tabla de Contenidos

- [🎯 Propósito del Proyecto](#-propósito-del-proyecto)
- [🏛️ Arquitectura y Patrones](#️-arquitectura-y-patrones)
  - [Capas de Clean Architecture](#capas-de-clean-architecture)
  - [CQRS (Command Query Responsibility Segregation)](#cqrs-command-query-responsibility-segregation)
  - [Transacciones con AsyncLocalStorage](#transacciones-con-asynclocalstorage)
  - [Rollback de Archivos Transaccional](#rollback-de-archivos-transaccional)
  - [Seguridad y Autenticación Avanzada](#seguridad-y-autenticación-avanzada)
  - [🔐 Sistema de Autenticación en Dos Pasos (2FA) y Desafíos](#-sistema-de-autenticación-en-dos-pasos-2fa-y-desafíos)
- [📂 Estructura del Repositorio](#-estructura-del-repositorio)
- [🛠️ Tecnologías y Librerías](#️-tecnologías-y-librerías)
- [🗄️ Sistema de Migraciones y Base de Datos](#️-sistema-de-migraciones-y-base-de-datos)
  - [Motor de Migraciones Personalizado](#motor-de-migraciones-personalizado)
  - [Esquema Inicial (`0001_init.sql`)](#esquema-inicial-0001_initsql)
  - [Cómo Crear una Nueva Migración](#cómo-crear-una-nueva-migración)
- [🚀 Guía de Inicio Rápido](#-guía-de-inicio-rápido)
  - [Prerrequisitos](#prerrequisitos)
  - [1. Clonar el repositorio](#1-clonar-el-repositorio)
  - [2. Instalar dependencias](#2-instalar-dependencias)
  - [3. Configuración de Variables de Entorno](#3-configuración-de-variables-de-entorno)
  - [4. Ejecutar Migraciones](#4-ejecutar-migraciones)
  - [5. Levantar el Servidor](#5-levantar-el-servidor)
- [📖 Documentación de la API (Swagger)](#-documentación-de-la-api-swagger)
- [🧪 Pruebas Automatizadas](#-pruebas-automatizadas)
- [📜 Scripts Disponibles](#-scripts-disponibles)
- [🤝 Contribución y Uso](#-contribución-y-uso)
- [📄 Licencia](#-licencia)

---

## 🎯 Propósito del Proyecto

Este repositorio cumple una doble función:
1. **Aporte a la comunidad (Boilerplate / Starter Kit):** Servir como plantilla de inicio lista para producción para desarrolladores que desean arrancar proyectos con NestJS sin acoplar su lógica de negocio al framework o al ORM, contando con estándares de seguridad, transacciones, migraciones, 2FA y autenticación ya resueltos.
2. **Portafolio Profesional:** Demostrar cómo aplicar patrones avanzados de arquitectura de software (Clean Architecture, DDD, CQRS, AsyncLocalStorage, Unit of Work, Advisory Locks, Decorators personalizados) en el ecosistema TypeScript/Node.js.

> [!TIP]
> **¿Deseas implementar esta misma arquitectura en Go, Java, PHP, .NET o Python?**  
> Hemos preparado una guía completa con la especificación técnica, matriz de equivalencias y código de referencia idiomático (con ejemplos detallados en Go + Gin): consulta el [Blueprint de Arquitectura Multi-Lenguaje (ARCHITECTURE_BLUEPRINT.md)](./ARCHITECTURE_BLUEPRINT.md).

---

## 🏛️ Arquitectura y Patrones

### Capas de Clean Architecture

El proyecto organiza el código en **Contextos Delimitados (Bounded Contexts)** bajo `src/contexts/`, aislando estrictamente las responsabilidades:

```
┌────────────────────────────────────────────────────────┐
│                   INFRAESTRUCTURA                      │
│   (Controllers, Repositories MySQL, Cron Jobs, HTTP)    │
│  ┌──────────────────────────────────────────────────┐  │
│  │                   APLICACIÓN                     │  │
│  │        (Casos de Uso, DTOs de Entrada)           │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │                    DOMINIO                 │  │  │
│  │  │       (Entidades, Reglas, Interfaces)      │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

1. **Dominio (`domain`):**
   - El núcleo de la lógica. No depende de NestJS, ni de MySQL ni de librerías externas.
   - Contiene las entidades puras (`User`, `InvalidToken`, `AuthChallenge`), tipos, enumeraciones e interfaces de repositorio (`UserRepository`, `InvalidTokenRepository`, `AuthChallengeRepository`).
2. **Aplicación (`application`):**
   - Contiene los casos de uso (`RegisterAuthUseCase`, `LoginAuthUseCase`, `VerifyTwoFactorAuthUseCase`, `ToggleTwoFactorUserUseCase`, etc.).
   - Orquesta el flujo de negocio, valida reglas y se comunica con abstracciones (interfaces).
3. **Infraestructura (`infrastructure`):**
   - Implementa los detalles técnicos: controladores NestJS (`UserCommandController`, `AuthCommandController`, `UserQueryController`), persistencia en base de datos (`UserMysqlImplements`, `InvalidTokenMysqlImpl`, `AuthChallengeMysqlImpl`), tareas programadas (`EmptyInvalidTokenAuthJob`), etc.
4. **Común (`common`):**
   - Transversales compartidos: filtros de excepciones globales (`ExceptionsFilter`), pipes de seguridad, guardias (`AuthGuard`), librerías de utilidad (`jwt-generator`, `password-hasher`, `files-storage`, `cookie-manager`, `cache-manager`).

---

### CQRS (Command Query Responsibility Segregation)

A nivel de controladores y casos de uso, las operaciones de modificación de estado (Commands) y de consulta de datos (Queries) están desacopladas:

- **Commands:** Controladores como `UserCommandController` y `AuthCommandController` gestionan mutaciones (crear usuario, actualizar contraseña, cerrar sesión, verificar 2FA, activar/desactivar 2FA).
- **Queries:** Controladores como `UserQueryController` gestionan lecturas optimizadas y paginadas (perfiles con estado de 2FA, listados filtrados).

---

### Transacciones con AsyncLocalStorage

Para evitar pasar la conexión a la base de datos a través de cada capa del caso de uso, el proyecto utiliza `AsyncLocalStorage` mediante decoradores declarativos:

- `@TransactionalDBConnection()`: Obtiene automáticamente una conexión del pool, inicia una transacción (`BEGIN TRANSACTION`), la asocia al contexto asíncrono de la petición y ejecuta `COMMIT` o `ROLLBACK` ante errores.
- `@SimpleDBConnection()`: Maneja el ciclo de vida de la conexión para lecturas y consultas sin sobrecarga transaccional.

Los repositorios (`BaseMysqlRepository`) leen la conexión activa directamente del contexto (`mysqlContext.getStore()`), manteniendo el código limpio y libre de boilerplate.

---

### Rollback de Archivos Transaccional

Cuando un endpoint sube un archivo (como un avatar) y luego falla la base de datos, el archivo subido quedaría huérfano en el disco.

Con el decorador `@FileRollback()` y `fileRollbackContext`, si la operación posterior falla, el sistema ejecuta automáticamente acciones de compensación (`Promise.allSettled`), eliminando los archivos subidos y garantizando consistencia atómica entre el sistema de archivos y la base de datos.

---

### Seguridad y Autenticación Avanzada

- **Dual-Token Authentication (Access + Refresh):**
  - `Access Token`: De corta duración (por defecto `15 min`), transmitido en headers Bearer.
  - `Refresh Token`: De larga duración (por defecto `7 días`), almacenado en cookies `HttpOnly`, `SameSite` y `Secure`.
- **Token Versioning:**
  - El campo `user_token_version` permite revocar **todas las sesiones activas** de un usuario instantáneamente cuando cambia su contraseña o se desactiva su cuenta.
- **Lista Negra con Cron Automático:**
  - Los tokens invalidados explícitamente (ej. logout) se registran en la tabla `invalid_tokens`.
  - Un cron job diario (`@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`) purga automáticamente los registros expirados.
- **Google OAuth 2.0:** Soporte nativo para inicio de sesión seguro con Google vía token de identidad verificado con `google-auth-library`. Compatible con 2FA si el usuario lo tiene activado.
- **Subida Segura de Archivos:**
  - Validación de extensiones y tipos MIME permitidos.
  - Procesamiento con `sharp` para sanitizar las imágenes, redimensionarlas y eliminar posibles payloads embebidos en metadatos.
- **Cabeceras HTTP y Rate Limit:**
  - `helmet` activado para protección contra ataques web comunes.
  - `@nestjs/throttler` configurado globalmente (30 req/seg) y reforzado en endpoints críticos de autenticación (5 req/seg).
  - CORS parametrizable por variables de entorno con validación estricta de orígenes.

---

### 🔐 Sistema de Autenticación en Dos Pasos (2FA) y Desafíos

El sistema incorpora un mecanismo de **Autenticación en Dos Pasos (2FA/MFA)** desacoplado y seguro, modelado a través de la entidad de dominio `AuthChallenge`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FLUJO DE INICIO DE SESIÓN CON 2FA                 │
└─────────────────────────────────────────────────────────────────────────────┘

 [Cliente]                 [Servidor (Auth Module)]              [Email / Usuario]
     │                                │                                │
     │── 1. POST /api/auth/login ────>│                                │
     │   (email + contraseña)         │                                │
     │                                │── Valida credenciales          │
     │                                │── Verifica 2FA activo? (Sí)    │
     │                                │── Crea AuthChallenge (LOGIN_2FA)│
     │                                │── Emite tempToken (JWT 5 min)  │
     │                                │── Envía código OTP (6 dígitos)─┼──> Recibe OTP
     │<── 2. Response: 200 OK ────────│                                │
     │    requiresTwoFactor: true     │                                │
     │    tempToken: "eyJhbG..."      │                                │
     │                                │                                │
     │── 3. POST /api/auth/verify-2fa>│                                │
     │   { tempToken, otp }           │                                │
     │                                │── Valida tempToken (purpose)   │
     │                                │── timingSafeEqual(otp, code)   │
     │                                │── Limita a máx. 3 intentos     │
     │                                │── Marca challenge como usado   │
     │                                │── Emite Access + Refresh Token │
     │<── 4. Response: 200 OK ────────│                                │
     │    (Set-Cookie: refreshToken)  │                                │
     │    { accessToken, user... }    │                                │
```

#### Características del 2FA:
1. **Flujo de Dos Fases (Challenge-Response):**
   - Si el usuario tiene `twoFactorEnabled: true`, `/api/auth/login` o `/api/auth/google` **no** emiten el token de sesión definitivo ni la cookie; en su lugar, devuelven `{ requiresTwoFactor: true, tempToken, email }` y envían un código OTP de 6 dígitos por correo.
   - El `tempToken` es un JWT de un solo propósito (`purpose: '2FA_CHALLENGE'`) que contiene de forma segura el `challengeId` y vence en 5 minutos.
2. **Protección contra Fuerza Bruta e Intentos Fallidos:**
   - Cada desafío rastrea el número de intentos fallidos (`challenge_attempts`).
   - Al superar **3 intentos incorrectos**, el desafío queda bloqueado (`isExceededAttempts()`) obligando a iniciar sesión nuevamente.
3. **Prevención de Ataques de Temporización (Timing Attacks):**
   - La comparación del código OTP recibido contra el esperado se realiza en tiempo constante con `crypto.timingSafeEqual`.
4. **Desafíos de Un Solo Uso:**
   - Una vez verificado con éxito, el desafío se marca como consumido (`challenge_used_at`) impidiendo ataques de repetición (*replay attacks*).
5. **Activación Configurable por Usuario:**
   - Endpoint protegido `PUT /api/users/:userId/2fa` (`{ enabled: true/false }`) para que los usuarios puedan gestionar la seguridad de su cuenta, invalidando la caché de sesión automáticamente.
6. **Desafíos Unificados:**
   - La misma arquitectura de `AuthChallenge` gestiona tanto el **2FA de Login** (`LOGIN_2FA`) como la **Recuperación de Contraseña** (`PASSWORD_RECOVERY`).

---

## 📂 Estructura del Repositorio

```text
clean-arch-node/
├── migrations/                    # Scripts SQL ordenados y versionados
│   └── 0001_init.sql              # Migración inicial (tablas users, invalid_tokens, auth_challenges)
├── scripts/                       # Herramientas de automatización y base de datos
│   ├── database/
│   │   └── migrator-mysql.ts      # Motor de migraciones con Advisory Locks de MySQL
│   └── run-migrations.ts          # Script ejecutor para pnpm run migrate
├── src/
│   ├── common/                    # Módulos y utilidades transversales
│   │   ├── constants/             # Constantes HTTP y de sistema
│   │   ├── decorators/            # @TransactionalDBConnection, @FileRollback, @CurrentUser, etc.
│   │   ├── dtos/                  # DTOs transversales (paginación, parámetros de ruta)
│   │   ├── enums/                 # Roles, estados, proveedores OAuth y AuthChallengeTypeEnum
│   │   ├── errors/                # Jerarquía de errores de dominio y aplicación
│   │   ├── filters/               # ExceptionsFilter global para mapeo HTTP
│   │   ├── guards/                # AuthGuard con validación de tokens y lista negra
│   │   ├── interfaces/            # Contratos de archivos, Unit of Work, JWT y 2FA payloads
│   │   ├── libs/                  # Adaptadores (JWT, Bcrypt, Sharp, Cache, Cookies, Brevo, OTP)
│   │   └── pipes/                 # UploadSecureFilePipe (sanitización de imágenes)
│   ├── config/
│   │   ├── db/                    # Módulo MySQL, Pool provider y Unit of Work
│   │   └── envs.ts                # Validación y tipado estricto de variables de entorno
│   ├── contexts/                  # Bounded Contexts (DDD)
│   │   ├── auth/                  # Contexto de Autenticación
│   │   │   ├── application/       # Casos de uso (Login, Register, Refresh, Logout, Google, 2FA, Recovery)
│   │   │   │   ├── login-auth-use-case/
│   │   │   │   ├── login-google-auth-use-case/
│   │   │   │   ├── verify-two-factor-auth-use-case/   # Verificación y canje de 2FA
│   │   │   │   ├── pass-recovery-step-one-auth-use-case/
│   │   │   │   ├── pass-recovery-step-two-auth-use-case/
│   │   │   │   └── ...
│   │   │   ├── domain/            # Entidades (InvalidToken, AuthChallenge) y Repositorios
│   │   │   └── infrastructure/    # Controladores, Jobs (Cron) y Repositorios MySQL
│   │   └── users/                 # Contexto de Usuarios
│   │       ├── application/       # Casos de uso (Perfil, Actualizar Contraseña, Toggle 2FA, Listados)
│   │       │   ├── toggle-two-factor-user-use-case/   # Activar / Desactivar 2FA
│   │       │   ├── update-password-user-use-case/
│   │       │   ├── update-profile-user-use-case/
│   │       │   └── ...
│   │       ├── domain/            # Entidad User, enums y UserRepository
│   │       └── infrastructure/    # Controladores Command/Query y Repositorio MySQL
│   ├── app.module.ts              # Módulo raíz de NestJS
│   └── main.ts                    # Bootstrap, configuración de Helmet, CORS, Swagger y Assets
├── test/                          # Pruebas e2e y configuración de Jest
├── .env.template                  # Plantilla documentada de variables de entorno
├── eslint.config.mjs              # Configuración moderna de ESLint (Flat Config)
├── nest-cli.json                  # Configuración del CLI de NestJS
├── package.json                   # Dependencias, scripts y metadatos
├── tsconfig.json                  # Configuración de TypeScript
└── LICENSE                        # Licencia MIT
```

---

## 🛠️ Tecnologías y Librerías

| Categoría | Tecnologías |
|---|---|
| **Core Framework** | [NestJS 12](https://nestjs.com/), [Express](https://expressjs.com/) |
| **Lenguaje** | [TypeScript 5](https://www.typescriptlang.org/) (ES2023 / NodeNext) |
| **Base de Datos** | [MySQL 8](https://www.mysql.com/) con el driver de alto rendimiento [`mysql2`](https://github.com/sidorares/node-mysql2) |
| **Seguridad y Criptografía** | [`helmet`](https://helmetjs.github.io/), [`@nestjs/throttler`](https://docs.nestjs.com/security/rate-limiting), [`bcryptjs`](https://github.com/dcodeIO/bcrypt.js), `crypto.timingSafeEqual` |
| **Autenticación** | [`jsonwebtoken`](https://github.com/auth0/node-jsonwebtoken), [`google-auth-library`](https://github.com/googleapis/google-auth-library-nodejs), OTP & 2FA Tokens |
| **Procesamiento de Archivos** | [`multer`](https://github.com/expressjs/multer), [`sharp`](https://sharp.pixelplumbing.com/) (procesamiento y sanitización de imágenes) |
| **Validación y Configuración** | [`class-validator`](https://github.com/typestack/class-validator), [`class-transformer`](https://github.com/typestack/class-transformer), [`env-var`](https://github.com/evanshortiss/env-var) |
| **Documentación** | [`@nestjs/swagger`](https://docs.nestjs.com/openapi/introduction) (OpenAPI 3.0) |
| **Tareas Programadas** | [`@nestjs/schedule`](https://docs.nestjs.com/techniques/task-scheduling) |
| **Testing** | [Jest 30](https://jestjs.io/), [Supertest](https://github.com/ladjs/supertest) |

---

## 🗄️ Sistema de Migraciones y Base de Datos

El repositorio incluye un sistema nativo y robusto de migraciones SQL sin necesidad de recurrir a ORMs pesados.

### Motor de Migraciones Personalizado

El motor (`scripts/database/migrator-mysql.ts`) incorpora características de nivel empresarial:

1. **Bloqueo Distribuido con Advisory Locks:** Utiliza `GET_LOCK('app_schema_migration_lock', 30)` y `RELEASE_LOCK` nativos de MySQL. Esto garantiza que si múltiples instancias o réplicas de la aplicación intentan migrar la base de datos simultáneamente (por ejemplo, en despliegues con Docker Swarm, Kubernetes o PM2 en clúster), solo una ejecutará las migraciones, evitando condiciones de carrera (*race conditions*).
2. **Tabla de Control de Versiones (`schema_migrations`):** Crea automáticamente una tabla para registrar cada archivo aplicado con su respectiva marca de tiempo:
   ```sql
   CREATE TABLE IF NOT EXISTS schema_migrations (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(255) NOT NULL UNIQUE,
     applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   ) ENGINE=InnoDB;
   ```
3. **Ordenamiento Secuencial y Ejecución Atómica:** Lee los archivos `.sql` en la carpeta `migrations/`, los ordena alfanuméricamente de manera natural (`0001_...`, `0002_...`, etc.) y aplica únicamente aquellos que aún no han sido registrados.

---

### Esquema Inicial (`0001_init.sql`)

Ubicado en `migrations/0001_init.sql`:

```sql
-- Tabla principal de usuarios
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_first_name VARCHAR(150) NOT NULL,
    user_email VARCHAR(150) NOT NULL UNIQUE,
    user_role ENUM('ADMIN', 'USUARIO') NOT NULL DEFAULT 'USUARIO',
    user_password VARCHAR(255) NOT NULL,
    user_oauth ENUM('MANUAL', 'GOOGLE') NOT NULL DEFAULT 'MANUAL',
    user_status ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    user_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_avatar VARCHAR(255) DEFAULT '',
    user_token_version INT NOT NULL DEFAULT 1,
    user_two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_user_email (user_email),
    INDEX idx_user_status (user_status),
    INDEX idx_user_role (user_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de tokens revocados (Blacklist)
CREATE TABLE IF NOT EXISTS invalid_tokens (
    inv_token_id INT AUTO_INCREMENT PRIMARY KEY,
    inv_token_payload VARCHAR(500) NOT NULL,
    inv_token_expiration DATETIME NOT NULL,
    INDEX idx_inv_token_payload (inv_token_payload),
    INDEX idx_inv_token_expiration (inv_token_expiration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de desafíos de autenticación (2FA y Recuperación de Contraseña)
CREATE TABLE IF NOT EXISTS auth_challenges (
    challenge_id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_code VARCHAR(255) NOT NULL,
    challenge_type ENUM('LOGIN_2FA', 'PASSWORD_RECOVERY') NOT NULL,
    challenge_attempts TINYINT NOT NULL DEFAULT 0,
    challenge_expires_at DATETIME NOT NULL,
    challenge_used_at DATETIME NULL,
    challenge_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_challenge_user_type (user_id, challenge_type),
    INDEX idx_challenge_expires (challenge_expires_at),
    CONSTRAINT fk_challenge_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Cómo Crear una Nueva Migración

Cuando agregues nuevas tablas o columnas a tu proyecto:

1. Crea un nuevo archivo en `migrations/` con prefijo numérico secuencial, por ejemplo:
   ```text
   migrations/0002_create_products_table.sql
   ```
2. Escribe las sentencias SQL correspondientes:
   ```sql
   CREATE TABLE IF NOT EXISTS products (
       product_id INT AUTO_INCREMENT PRIMARY KEY,
       product_name VARCHAR(150) NOT NULL,
       product_price DECIMAL(10,2) NOT NULL,
       product_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   ) ENGINE=InnoDB;
   ```
3. Ejecuta el comando de migración:
   ```bash
   pnpm run migrate
   ```
El sistema detectará que `0001_init.sql` ya fue aplicada, ejecutará únicamente `0002_create_products_table.sql` y la registrará en `schema_migrations`.

---

## 🚀 Guía de Inicio Rápido

### Prerrequisitos

- **Node.js** >= 20.x (recomendado v22 o v24 LTS)
- Gestor de paquetes **pnpm** (recomendado) o **npm**
- Servidor **MySQL** 8.0+ en ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/ceperez4/clean-arch-node.git
cd clean-arch-node
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configuración de Variables de Entorno

Copia la plantilla `.env.template` a `.env`:

```bash
cp .env.template .env
```

Ajusta los valores según tu entorno local:

```env
APP_PORT=3000
APP_URL=http://localhost:3000
NODE_ENV=dev

# Configuración de MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=tu_contraseña
DB_NAME=node_app
DB_CONNECTION_LIMIT=10

# Secretos JWT (¡genera claves robustas para producción!)
JWT_ACCESS_SECRET=tu_clave_secreta_acceso
JWT_REFRESH_SECRET=tu_clave_secreta_refresh
JWT_ACCESS_EXPIRES_IN=15Min
JWT_REFRESH_EXPIRES_IN=7D
MAX_AGE_REFRESH_COOKIE=604800000

# OAuth de Google (opcional o de prueba)
GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Ejecutar Migraciones

Aplica las migraciones pendientes con un solo comando:

```bash
pnpm run migrate
```

*Salida esperada:*
```text
Esperando bloqueo de migraciones...
Bloqueo adquirido. Verificando estado del esquema...
Aplicando migración: 0001_init.sql...
✓ Aplicada: 0001_init.sql
Todas las migraciones se completaron con éxito.
```

### 5. Levantar el Servidor

```bash
# Modo desarrollo con recarga en caliente
pnpm run start:dev

# Modo producción
pnpm run build
pnpm run start:prod
```

Una vez levantado, la aplicación estará escuchando en `http://localhost:3000/api`.

---

## 📖 Documentación de la API (Swagger)

Con la aplicación en marcha, ingresa a la documentación interactiva en:

📍 **[http://localhost:3000/docs](http://localhost:3000/docs)**

### Principales Endpoints

#### 🔐 Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registro de nuevo usuario | Público |
| `POST` | `/api/auth/login` | Iniciar sesión (retorna par de tokens o `tempToken` si requiere 2FA) | Público |
| `POST` | `/api/auth/google` | Iniciar sesión / Registro con Google OAuth (compatible con 2FA) | Público |
| `POST` | `/api/auth/verify-2fa` | **Verificar código OTP y completar login** (retorna token + cookie) | Público |
| `POST` | `/api/auth/refresh` | Refrescar Access Token mediante Cookie o Body | Público |
| `POST` | `/api/auth/logout` | Cerrar sesión y agregar token a lista negra | Público |
| `POST` | `/api/auth/recover-pass-one` | Solicitar código OTP para recuperación de contraseña | Público |
| `POST` | `/api/auth/recover-pass-two` | Validar OTP y restablecer contraseña | Público |

#### 👤 Usuarios (`/api/users`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/users/:id/profile` | Consultar perfil de usuario (incluye estado `twoFactor`) | Autenticado |
| `PUT` | `/api/users/:userId/2fa` | **Activar o desactivar autenticación en dos pasos (2FA)** | Autenticado (Propio / ADMIN) |
| `PUT` | `/api/users/:userId/profile` | Actualizar perfil y subir avatar (Multipart) | Autenticado |
| `PUT` | `/api/users/:userId/pass` | Cambiar contraseña | Autenticado |
| `GET` | `/api/users` | Listar usuarios con paginación y filtros | Rol ADMIN |

---

## 🧪 Pruebas Automatizadas

```bash
# Ejecutar pruebas unitarias
pnpm run test

# Ejecutar pruebas con reporte de cobertura
pnpm run test:cov

# Ejecutar pruebas e2e
pnpm run test:e2e
```

---

## 📜 Scripts Disponibles

| Comando | Acción |
|---|---|
| `pnpm run migrate` | Ejecuta el motor de migraciones con Advisory Locks y control de versiones |
| `pnpm run start:dev` | Inicia el servidor en modo desarrollo con recarga automática |
| `pnpm run build` | Compila la aplicación TypeScript a JavaScript en `./dist` |
| `pnpm run start:prod` | Ejecuta el bundle compilado de producción |
| `pnpm run lint` | Ejecuta ESLint con auto-corrección de estilo y buenas prácticas |
| `pnpm run format` | Da formato a todo el código con Prettier |
| `pnpm run test` | Ejecuta la suite de pruebas unitarias con Jest |
| `pnpm run test:e2e` | Ejecuta la suite de pruebas end-to-end |

---

## 🤝 Contribución y Uso

Este repositorio está pensado para ser clonado y adaptado libremente:

1. Haz un fork del proyecto.
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`).
3. Confirma tus cambios (`git commit -m 'feat: agrega nueva funcionalidad'`).
4. Sube la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia **MIT**. Eres libre de usarlo, modificarlo y distribuirlo para fines personales, educativos o comerciales con atribución de copyright.

Para más detalles, consulta el archivo [LICENSE](LICENSE).

---

<div align="center">
  Desarrollado con dedicación por <strong>Christian Pérez</strong>
</div>
