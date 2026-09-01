CREATE TYPE "public"."contribution_status" AS ENUM('Nouveau', 'En étude', 'En cours', 'Résolu');--> statement-breakpoint
CREATE TYPE "public"."contribution_type" AS ENUM('Besoin', 'Idée');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('member', 'event', 'contribution');--> statement-breakpoint
CREATE TABLE "contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"author" varchar(160) NOT NULL,
	"neighborhood" varchar(160) NOT NULL,
	"type" "contribution_type" NOT NULL,
	"status" "contribution_status" DEFAULT 'Nouveau' NOT NULL,
	"description" text NOT NULL,
	"phone" varchar(40) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day" varchar(2) NOT NULL,
	"weekday" varchar(12) NOT NULL,
	"title" text NOT NULL,
	"time" varchar(80) NOT NULL,
	"place" text NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"neighborhood" varchar(160) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "members_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contributions_created_at_idx" ON "contributions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contributions_status_idx" ON "contributions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("read");