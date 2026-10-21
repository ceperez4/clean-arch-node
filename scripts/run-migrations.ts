import { run } from './database/migrator-mysql';

async function main() {
  await run();
}

void main();