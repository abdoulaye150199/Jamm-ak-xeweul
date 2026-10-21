import 'server-only';

import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import WebSocket from 'ws';

// Simple queries use HTTP; interactive transactions retain WebSocket sessions.
neonConfig.poolQueryViaFetch = true;
neonConfig.webSocketConstructor = WebSocket;
neonConfig.fetchFunction = (input: RequestInfo | URL, init?: RequestInit) => fetch(input, {
  ...init,
  cache: 'no-store',
  signal: init?.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000),
});

let database: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL est manquante. Ajoute la chaîne de connexion Neon dans .env.local.');
  if (!database) {
    const pool = new Pool({ connectionString, max: 5, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000, allowExitOnIdle: true });
    pool.on('error', (error: Error & { code?: string }) => console.error('Neon pool connection failed:', { code: error.code }));
    database = drizzle(pool);
  }
  return database;
}
