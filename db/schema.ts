import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const contributionTypeEnum = pgEnum('contribution_type', ['Besoin', 'Idée']);
export const contributionStatusEnum = pgEnum('contribution_status', ['Nouveau', 'En étude', 'En cours', 'Résolu']);
export const notificationTypeEnum = pgEnum('notification_type', ['member', 'event', 'contribution']);

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventDate: timestamp('event_date', { withTimezone: true }),
  day: varchar('day', { length: 2 }).notNull(),
  weekday: varchar('weekday', { length: 12 }).notNull(),
  title: text('title').notNull(),
  time: varchar('time', { length: 80 }).notNull(),
  place: text('place').notNull(),
  featured: boolean('featured').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  }, table => ({
    createdAtIdx: index('events_created_at_idx').on(table.createdAt),
    eventDateIdx: index('events_event_date_idx').on(table.eventDate),
}));

export const members = pgTable('members', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  neighborhood: varchar('neighborhood', { length: 160 }).notNull(),
  phone: varchar('phone', { length: 40 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, table => ({
  createdAtIdx: index('members_created_at_idx').on(table.createdAt),
}));

export const contributions = pgTable('contributions', {
  id: uuid('id').defaultRandom().primaryKey(),
  memberId: uuid('member_id').references(() => members.id),
  title: text('title').notNull(),
  author: varchar('author', { length: 160 }).notNull(),
  neighborhood: varchar('neighborhood', { length: 160 }).notNull(),
  type: contributionTypeEnum('type').notNull(),
  status: contributionStatusEnum('status').default('Nouveau').notNull(),
  description: text('description').notNull(),
  phone: varchar('phone', { length: 40 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  }, table => ({
    createdAtIdx: index('contributions_created_at_idx').on(table.createdAt),
    statusIdx: index('contributions_status_idx').on(table.status),
    memberIdIdx: index('contributions_member_id_idx').on(table.memberId),
}));

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  read: boolean('read').default(false).notNull(),
}, table => ({
  createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
  readIdx: index('notifications_read_idx').on(table.read),
}));
