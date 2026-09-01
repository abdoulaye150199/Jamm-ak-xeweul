import 'server-only';

import { desc } from 'drizzle-orm';
import { contributions, events, members, notifications } from '@/db/schema';
import { getDb } from '@/lib/db';

export type StoredEvent = {
  id: string;
  day: string;
  weekday: string;
  title: string;
  time: string;
  place: string;
  featured?: boolean;
  createdAt: string;
};

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  neighborhood: string;
  phone: string;
  createdAt: string;
};

export type ContributionRecord = {
  id: string;
  title: string;
  author: string;
  neighborhood: string;
  type: 'Besoin' | 'Idée';
  status: 'Nouveau' | 'En étude' | 'En cours' | 'Résolu';
  description: string;
  phone: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  type: 'member' | 'event' | 'contribution';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export type AdminSnapshot = {
  events: StoredEvent[];
  members: Member[];
  contributions: ContributionRecord[];
  notifications: Notification[];
};

function toIso(value: Date) {
  return value.toISOString();
}

function mapEvent(row: typeof events.$inferSelect): StoredEvent {
  return { ...row, createdAt: toIso(row.createdAt) };
}

function mapMember(row: typeof members.$inferSelect): Member {
  return { ...row, createdAt: toIso(row.createdAt) };
}

function mapContribution(row: typeof contributions.$inferSelect): ContributionRecord {
  return { ...row, createdAt: toIso(row.createdAt) };
}

function mapNotification(row: typeof notifications.$inferSelect): Notification {
  return { ...row, createdAt: toIso(row.createdAt) };
}

export async function getEvents() {
  const rows = await getDb().select().from(events).orderBy(desc(events.createdAt));
  return rows.map(mapEvent);
}

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  const db = getDb();
  const [eventRows, memberRows, contributionRows, notificationRows] = await Promise.all([
    db.select().from(events).orderBy(desc(events.createdAt)),
    db.select().from(members).orderBy(desc(members.createdAt)),
    db.select().from(contributions).orderBy(desc(contributions.createdAt)),
    db.select().from(notifications).orderBy(desc(notifications.createdAt)),
  ]);
  return {
    events: eventRows.map(mapEvent),
    members: memberRows.map(mapMember),
    contributions: contributionRows.map(mapContribution),
    notifications: notificationRows.map(mapNotification),
  };
}

export async function addEvent(input: Omit<StoredEvent, 'id' | 'createdAt'>) {
  const db = getDb();
  const createdAt = new Date();
  const [event] = await db.insert(events).values({ ...input, createdAt }).returning();
  await db.insert(notifications).values({
    type: 'event',
    title: 'Nouvel événement publié',
    message: event.title,
    createdAt,
    read: true,
  });
  return mapEvent(event);
}

export async function addMember(input: Omit<Member, 'id' | 'createdAt'>) {
  const db = getDb();
  const createdAt = new Date();
  const [member] = await db.insert(members).values({ ...input, createdAt }).returning();
  await db.insert(notifications).values({
    type: 'member',
    title: 'Nouvelle adhésion',
    message: `${member.firstName} ${member.lastName} vient de rejoindre le mouvement.`,
    createdAt,
    read: false,
  });
  return mapMember(member);
}

export async function addContribution(input: Omit<ContributionRecord, 'id' | 'createdAt' | 'status'>) {
  const db = getDb();
  const createdAt = new Date();
  const [contribution] = await db.insert(contributions).values({ ...input, createdAt, status: 'Nouveau' }).returning();
  await db.insert(notifications).values({
    type: 'contribution',
    title: 'Nouvelle contribution',
    message: `${contribution.author} a envoyé : ${contribution.title}.`,
    createdAt,
    read: false,
  });
  return mapContribution(contribution);
}

export async function markNotificationsRead() {
  await getDb().update(notifications).set({ read: true });
}
