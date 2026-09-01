import path from 'path';
import { loadEnvConfig } from '@next/env';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

loadEnvConfig(process.cwd());

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL est manquante. Ajoute la chaîne Neon avant de lancer la migration.');

  const db = drizzle(neon(connectionString));
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
  console.log('Migration Drizzle → Neon terminée.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
