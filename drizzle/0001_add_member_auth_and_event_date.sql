ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "password_hash" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "event_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN IF NOT EXISTS "member_id" uuid REFERENCES "members"("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contributions_member_id_idx" ON "contributions" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_event_date_idx" ON "events" USING btree ("event_date");
