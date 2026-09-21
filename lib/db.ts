import 'server-only';

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

let database: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL est manquante. Ajoute la chaîne de connexion Neon dans .env.local.');
  if (!database) database = drizzle(new Pool({ connectionString }));
  return database;
}
