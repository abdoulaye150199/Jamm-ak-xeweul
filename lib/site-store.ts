import 'server-only';

import { and, count, countDistinct, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm';
import { contributions, events, members, notifications } from '@/db/schema';
import { getDb } from '@/lib/db';
import { readDatabase } from '@/lib/db-retry';

export type StoredEvent = {
  id: string;
  eventDate: string | null;
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
  memberId: string | null;
  title: string;
  author: string;
  neighborhood: string;
  type: 'Besoin' | 'Idée';
  status: 'Nouveau' | 'En étude' | 'En cours' | 'Résolu';
  description: string;
  phone: string;
  image: string | null;
  createdAt: string;
};

export type Notification = {
  id: string;
  memberId: string | null;
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

export type AdminPage = {
  items: Array<ContributionRecord | Member | StoredEvent>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function toIso(value: Date) {
  return value.toISOString();
}

function mapEvent(row: typeof events.$inferSelect): StoredEvent {
  return { ...row, eventDate: row.eventDate ? toIso(row.eventDate) : null, createdAt: toIso(row.createdAt) };
}

function mapMember(row: typeof members.$inferSelect): Member {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    neighborhood: row.neighborhood,
    phone: row.phone,
    createdAt: toIso(row.createdAt),
  };
}

function mapContribution(row: typeof contributions.$inferSelect): ContributionRecord {
  return { ...row, createdAt: toIso(row.createdAt) };
}

function mapNotification(row: typeof notifications.$inferSelect): Notification {
  return { ...row, createdAt: toIso(row.createdAt) };
}

export async function getEvents() {
  const rows = await readDatabase(() => getDb().select().from(events).orderBy(sql`${events.eventDate} DESC NULLS LAST, ${events.createdAt} DESC`));
  return rows.map(mapEvent);
}

export async function getPublicStats() {
  const [stats] = await readDatabase(() => getDb().select({
    members: count(),
    neighborhoods: countDistinct(members.neighborhood),
    actions: sql<number>`(select count(*) from ${events})`,
  }).from(members));
  return { members: Number(stats.members), neighborhoods: Number(stats.neighborhoods), actions: Number(stats.actions) };
}

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  const db = getDb();
  const [eventRows, memberRows, contributionRows, notificationRows] = await readDatabase(() => Promise.all([
    db.select().from(events).orderBy(sql`${events.eventDate} DESC NULLS LAST, ${events.createdAt} DESC`),
    db.select().from(members).orderBy(desc(members.createdAt)),
    db.select().from(contributions).orderBy(desc(contributions.createdAt)),
    db.select().from(notifications).where(isNull(notifications.memberId)).orderBy(desc(notifications.createdAt)),
  ]));
  return {
    events: eventRows.map(mapEvent),
    members: memberRows.map(mapMember),
    contributions: contributionRows.map(mapContribution),
    notifications: notificationRows.map(mapNotification),
  };
}

export async function getRecentNotifications() {
  const rows = await readDatabase(() => getDb().select().from(notifications).where(isNull(notifications.memberId)).orderBy(desc(notifications.createdAt)).limit(20));
  return rows.map(mapNotification);
}

export async function getAdminPage(section: 'contributions' | 'members' | 'events', page: number, pageSize: number, query: string, type?: 'Besoin' | 'Idée'): Promise<AdminPage> {
  const db = getDb();
  const offset = (page - 1) * pageSize;
  const search = query.trim();

  if (section === 'contributions') {
    const where = and(
      search ? or(ilike(contributions.title, `%${search}%`), ilike(contributions.author, `%${search}%`), ilike(contributions.neighborhood, `%${search}%`)) : undefined,
      type ? eq(contributions.type, type) : undefined,
    );
    const [rows, [{ value }]] = await readDatabase(() => Promise.all([
      db.select().from(contributions).where(where).orderBy(desc(contributions.createdAt)).limit(pageSize).offset(offset),
      db.select({ value: count() }).from(contributions).where(where),
    ]));
    return { items: rows.map(mapContribution), total: Number(value), page, pageSize, totalPages: Math.max(1, Math.ceil(Number(value) / pageSize)) };
  }

  if (section === 'members') {
    const where = search ? or(ilike(members.firstName, `%${search}%`), ilike(members.lastName, `%${search}%`), ilike(members.email, `%${search}%`), ilike(members.neighborhood, `%${search}%`)) : undefined;
    const [rows, [{ value }]] = await readDatabase(() => Promise.all([
      db.select().from(members).where(where).orderBy(desc(members.createdAt)).limit(pageSize).offset(offset),
      db.select({ value: count() }).from(members).where(where),
    ]));
    return { items: rows.map(mapMember), total: Number(value), page, pageSize, totalPages: Math.max(1, Math.ceil(Number(value) / pageSize)) };
  }

  const where = search ? or(ilike(events.title, `%${search}%`), ilike(events.place, `%${search}%`), ilike(events.weekday, `%${search}%`)) : undefined;
  const [rows, [{ value }]] = await readDatabase(() => Promise.all([
    db.select().from(events).where(where).orderBy(sql`${events.eventDate} DESC NULLS LAST, ${events.createdAt} DESC`).limit(pageSize).offset(offset),
    db.select({ value: count() }).from(events).where(where),
  ]));
  return { items: rows.map(mapEvent), total: Number(value), page, pageSize, totalPages: Math.max(1, Math.ceil(Number(value) / pageSize)) };
}

export async function addEvent(input: Omit<StoredEvent, 'id' | 'createdAt' | 'eventDate'> & { eventDate: Date | null }) {
  const db = getDb();
  const createdAt = new Date();
  const event = await db.transaction(async tx => {
    const [createdEvent] = await tx.insert(events).values({ ...input, createdAt }).returning();
    const memberRows = await tx.select({ id: members.id }).from(members);
    const eventMessage = `${createdEvent.title} · ${createdEvent.day} ${createdEvent.time} · ${createdEvent.place}`;
    await tx.insert(notifications).values([
      {
        type: 'event',
        title: 'Nouvelle activité publiée',
        message: eventMessage,
        createdAt,
        read: false,
      },
      ...memberRows.map(member => ({
        memberId: member.id,
        type: 'event' as const,
        title: 'Nouvelle activité publiée',
        message: eventMessage,
        createdAt,
        read: false,
      })),
    ]);
    return createdEvent;
  });
  return mapEvent(event);
}

export async function addMember(input: Omit<Member, 'id' | 'createdAt'> & { passwordHash: string }) {
  const db = getDb();
  const createdAt = new Date();
  const member = await db.transaction(async tx => {
    const [createdMember] = await tx.insert(members).values({ ...input, createdAt }).returning();
    await tx.insert(notifications).values({
      type: 'member',
      title: 'Nouvelle adhésion',
      message: `${createdMember.firstName} ${createdMember.lastName} vient de rejoindre le mouvement.`,
      createdAt,
      read: false,
    });
    return createdMember;
  });
  return mapMember(member);
}

export async function addContribution(input: Omit<ContributionRecord, 'id' | 'createdAt' | 'status' | 'memberId'> & { memberId: string | null }) {
  const db = getDb();
  const createdAt = new Date();
  const contribution = await db.transaction(async tx => {
    const [createdContribution] = await tx.insert(contributions).values({ ...input, createdAt, status: 'Nouveau' }).returning();
    await tx.insert(notifications).values({
      type: 'contribution',
      title: 'Contribution à approuver',
      message: `${createdContribution.author} a envoyé « ${createdContribution.title} ».`,
      createdAt,
      read: false,
    });
    return createdContribution;
  });
  return mapContribution(contribution);
}

export async function getMemberByEmail(email: string) {
  const [member] = await readDatabase(() => getDb().select().from(members).where(eq(members.email, email)).limit(1));
  return member ?? null;
}

export async function getMemberById(id: string) {
  const [member] = await readDatabase(() => getDb().select().from(members).where(eq(members.id, id)).limit(1));
  return member ? mapMember(member) : null;
}

export async function getAdminMemberDetails(id: string) {
  const member = await getMemberById(id);
  if (!member) return null;
  const db = getDb();
  const [recentContributions, [totals]] = await readDatabase(() => Promise.all([
    db.select({
      id: contributions.id,
      title: contributions.title,
      type: contributions.type,
      status: contributions.status,
      description: contributions.description,
      createdAt: contributions.createdAt,
    }).from(contributions).where(eq(contributions.memberId, id)).orderBy(desc(contributions.createdAt)).limit(10),
    db.select({ total: count(), ideas: sql<number>`count(*) filter (where ${contributions.type} = 'Idée')` })
      .from(contributions).where(eq(contributions.memberId, id)),
  ]));
  return {
    member,
    contributions: recentContributions.map(row => ({ ...row, createdAt: toIso(row.createdAt) })),
    contributionCount: Number(totals.total),
    ideaCount: Number(totals.ideas),
  };
}

export async function deleteMember(id: string) {
  return getDb().transaction(async tx => {
    const [member] = await tx.select({ id: members.id }).from(members).where(eq(members.id, id)).for('update');
    if (!member) return null;
    // Keep community reports while removing their link to the deleted account.
    await tx.update(contributions).set({ memberId: null }).where(eq(contributions.memberId, id));
    await tx.delete(notifications).where(eq(notifications.memberId, id));
    await tx.delete(members).where(eq(members.id, id));
    return member;
  });
}

export async function getMemberContributions(memberId: string) {
  const rows = await readDatabase(() => getDb().select().from(contributions).where(eq(contributions.memberId, memberId)).orderBy(desc(contributions.createdAt)));
  return rows.map(mapContribution);
}

export async function updateContributionStatus(id: string, status: ContributionRecord['status']) {
  const [row] = await getDb().update(contributions).set({ status }).where(eq(contributions.id, id)).returning();
  return row ? mapContribution(row) : null;
}

export async function markNotificationsRead() {
  await getDb().update(notifications).set({ read: true }).where(isNull(notifications.memberId));
}

export async function getMemberNotifications(memberId: string) {
  const rows = await readDatabase(() => getDb().select().from(notifications).where(eq(notifications.memberId, memberId)).orderBy(desc(notifications.createdAt)).limit(20));
  return rows.map(mapNotification);
}

export async function markMemberNotificationsRead(memberId: string) {
  await getDb().update(notifications).set({ read: true }).where(eq(notifications.memberId, memberId));
}
