import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { loadEnvConfig } from '@next/env';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { contributions, events, members, notifications } from '@/db/schema';

type LegacyStore = {
  events?: Array<Record<string, unknown>>;
  members?: Array<Record<string, unknown>>;
  contributions?: Array<Record<string, unknown>>;
  notifications?: Array<Record<string, unknown>>;
};

loadEnvConfig(process.cwd());

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL est manquante. Ajoute la chaîne Neon avant de lancer cette migration.');

  const sourcePath = path.join(process.cwd(), 'data', 'site-store.json');
  if (!existsSync(sourcePath)) {
    console.log('Aucun fichier data/site-store.json à migrer.');
    return;
  }

  const source = JSON.parse(readFileSync(sourcePath, 'utf8')) as LegacyStore;
  const db = drizzle(neon(connectionString));

  const tx = db;
  for (const event of source.events ?? []) {
    await tx.insert(events).values({
      id: String(event.id),
      eventDate: event.eventDate ? new Date(String(event.eventDate)) : null,
      day: String(event.day),
      weekday: String(event.weekday),
      title: String(event.title),
      time: String(event.time),
      place: String(event.place),
      featured: Boolean(event.featured),
      createdAt: new Date(String(event.createdAt)),
    }).onConflictDoNothing();
  }

  for (const member of source.members ?? []) {
    await tx.insert(members).values({
      id: String(member.id),
      firstName: String(member.firstName),
      lastName: String(member.lastName),
      email: String(member.email),
      neighborhood: String(member.neighborhood),
      phone: String(member.phone),
      createdAt: new Date(String(member.createdAt)),
    }).onConflictDoNothing();
  }

  for (const contribution of source.contributions ?? []) {
    await tx.insert(contributions).values({
      id: String(contribution.id),
      title: String(contribution.title),
      author: String(contribution.author),
      neighborhood: String(contribution.neighborhood),
      type: contribution.type as 'Besoin' | 'Idée',
      status: contribution.status as 'Nouveau' | 'En étude' | 'En cours' | 'Résolu',
      description: String(contribution.description),
      phone: String(contribution.phone),
      createdAt: new Date(String(contribution.createdAt)),
    }).onConflictDoNothing();
  }

  for (const notification of source.notifications ?? []) {
    await tx.insert(notifications).values({
      id: String(notification.id),
      type: notification.type as 'member' | 'event' | 'contribution',
      title: String(notification.title),
      message: String(notification.message),
      createdAt: new Date(String(notification.createdAt)),
      read: Boolean(notification.read),
    }).onConflictDoNothing();
  }
  

  console.log('Migration JSON → Neon terminée.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
