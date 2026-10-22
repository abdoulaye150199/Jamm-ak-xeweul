import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { loadEnvConfig } from '@next/env';
import { neon } from '@neondatabase/serverless';
import { createMemberSessionToken, MEMBER_SESSION_COOKIE } from '../lib/member-auth';

const baseUrl = process.env.TEST_BASE_URL;

test('only administrators can edit and delete events, with changes reflected in both agendas', { skip: !baseUrl }, async () => {
  assert.ok(baseUrl);
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(baseUrl).hostname), 'Run this integration test against a local server.');
  loadEnvConfig(process.cwd());
  assert.ok(process.env.DATABASE_URL && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET, 'Configure the local database and administrator before testing.');
  const query = neon(process.env.DATABASE_URL);
  const targetId = randomUUID();
  const otherId = randomUUID();
  const memberId = randomUUID();
  const marker = `event-test-${randomUUID()}`;
  const memberCookie = `${MEMBER_SESSION_COOKIE}=${createMemberSessionToken(memberId)}`;
  const input = { date: '2028-02-29', title: `${marker}-updated`, time: ' 18h30 — 20h00 ', place: `${marker}-new-place`, featured: true };
  const request = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(`${baseUrl}${path}`, { ...options, signal: AbortSignal.timeout(30000) });
    return { status: response.status, data: await response.json().catch(() => null) };
  };
  const path = `/api/admin/events/${targetId}`;
  const jsonHeaders = { 'Content-Type': 'application/json' };

  try {
    // Insert fixtures directly so the publication API never broadcasts test events to real members.
    await query.transaction([
      query`INSERT INTO events (id,day,weekday,title,time,place) VALUES (${targetId},'01','lun',${marker},'12h00',${marker}),(${otherId},'02','mar',${marker + '-other'},'10h00',${marker})`,
      query`INSERT INTO members (id,first_name,last_name,email,neighborhood,phone) VALUES (${memberId},'Verification',${marker},${marker + '@example.invalid'},'Nguinth','000000000')`,
    ]);
    const [original] = await query`SELECT created_at FROM events WHERE id=${targetId}`;
    const [untouchedEvent] = await query`SELECT * FROM events WHERE id=${otherId}`;
    const login = await fetch(`${baseUrl}/api/admin/login`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }), signal: AbortSignal.timeout(20000) });
    assert.equal(login.status, 200);
    const adminCookie = login.headers.get('set-cookie')?.split(';')[0];
    assert.ok(adminCookie);
    const adminHeaders = { ...jsonHeaders, cookie: adminCookie };

    for (const method of ['PATCH', 'DELETE']) {
      const options = { method, body: method === 'PATCH' ? JSON.stringify(input) : undefined };
      assert.equal((await request(path, { ...options, headers: jsonHeaders })).status, 401);
      assert.equal((await request(path, { ...options, headers: { ...jsonHeaders, cookie: memberCookie } })).status, 401);
      assert.equal((await request('/api/admin/events/invalid-id', { ...options, headers: adminHeaders })).status, 400);
      assert.equal((await request(`/api/admin/events/${randomUUID()}`, { ...options, headers: adminHeaders })).status, 404);
    }
    for (const body of ['{', 'null', '[]', '{}', JSON.stringify({ ...input, date: '2026-02-30' }), JSON.stringify({ ...input, title: 'x'.repeat(201) }), JSON.stringify({ ...input, featured: 'true' })]) {
      assert.equal((await request(path, { method: 'PATCH', headers: adminHeaders, body })).status, 400);
    }
    const [unchanged] = await query`SELECT title,event_date FROM events WHERE id=${targetId}`;
    assert.equal(unchanged.title, marker);
    assert.equal(unchanged.event_date, null);

    const updated = await request(path, { method: 'PATCH', headers: adminHeaders, body: JSON.stringify({ ...input, id: otherId, day: '01', weekday: 'faux', createdAt: '2000-01-01' }) });
    assert.equal(updated.status, 200);
    assert.equal(updated.data.event.id, targetId);
    assert.equal(updated.data.event.eventDate, '2028-02-29T12:00:00.000Z');
    assert.equal(updated.data.event.day, '29');
    assert.equal(updated.data.event.weekday, 'mar');
    assert.equal(updated.data.event.time, input.time.trim());
    assert.equal(updated.data.event.place, input.place);
    assert.equal(updated.data.event.featured, true);
    assert.equal(new Date(updated.data.event.createdAt).getTime(), new Date(original.created_at).getTime());
    const listing = await request(`/api/admin/dashboard?section=events&q=${encodeURIComponent(input.title)}`, { headers: { cookie: adminCookie } });
    assert.equal(listing.status, 200);
    assert.equal(listing.data.total, 1);
    assert.equal(listing.data.items[0].id, targetId);

    const checkAgendas = async (visible: boolean) => {
      for (const [page, cookie] of [['/', ''], ['/activites', ''], ['/espace-membre?section=activites', memberCookie]]) {
        const response = await fetch(`${baseUrl}${page}`, { headers: { cookie }, signal: AbortSignal.timeout(30000) });
        assert.equal(response.status, 200);
        const html = await response.text();
        assert.equal(html.includes(input.title), visible, `${page} must reflect the event mutation`);
      }
    };
    await checkAgendas(true);
    const unfeatured = await request(path, { method: 'PATCH', headers: adminHeaders, body: JSON.stringify({ ...input, featured: false }) });
    assert.equal(unfeatured.status, 200);
    assert.equal(unfeatured.data.event.featured, false);
    assert.equal((await request(path, { method: 'DELETE', headers: { cookie: adminCookie } })).status, 200);
    assert.equal((await request(path, { method: 'PATCH', headers: adminHeaders, body: JSON.stringify(input) })).status, 404);
    assert.equal((await request(path, { method: 'DELETE', headers: { cookie: adminCookie } })).status, 404);
    await checkAgendas(false);
    const after = await request(`/api/admin/dashboard?section=events&q=${encodeURIComponent(input.title)}`, { headers: { cookie: adminCookie } });
    assert.equal(after.data.total, 0);
    const [remainingEvent] = await query`SELECT * FROM events WHERE id=${otherId}`;
    assert.deepEqual(remainingEvent, untouchedEvent, 'Editing and deleting must not change any other event');
  } finally {
    await query.transaction([
      query`DELETE FROM events WHERE id IN (${targetId},${otherId})`,
      query`DELETE FROM members WHERE id=${memberId}`,
    ]);
    const [leftovers] = await query`SELECT (SELECT count(*) FROM events WHERE id IN (${targetId},${otherId})) + (SELECT count(*) FROM members WHERE id=${memberId}) AS total`;
    assert.equal(Number(leftovers.total), 0, 'Temporary test records must be removed');
  }
});
