import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL est manquante. Ajoute la chaîne de connexion Neon dans .env.local.');
  return drizzle(neon(connectionString));
}
