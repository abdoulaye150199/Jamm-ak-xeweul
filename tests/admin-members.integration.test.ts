import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { loadEnvConfig } from '@next/env';
import { neon } from '@neondatabase/serverless';

const baseUrl = process.env.TEST_BASE_URL;

test('only administrators can inspect and delete members without losing contributions or affecting other accounts', { skip: !baseUrl }, async () => {
  assert.ok(baseUrl);
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(baseUrl).hostname), 'Run this integration test against a local server.');
  loadEnvConfig(process.cwd());
  assert.ok(process.env.DATABASE_URL && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD, 'Configure the local database and administrator before testing.');
  const query = neon(process.env.DATABASE_URL);
  const marker = `member-test-${randomUUID()}`;
  const fixtures = ['target', 'other'].map(suffix => ({
    firstName: 'Verification', lastName: `${marker}-${suffix}`,
    email: `${marker}-${suffix}@example.invalid`, password: randomUUID(),
    neighborhood: 'Nguinth', phone: '000000000', title: `${marker}-${suffix}`,
  }));
  const [target, other] = fixtures;
  const request = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(`${baseUrl}${path}`, { ...options, signal: AbortSignal.timeout(20000) });
    const data = await response.json().catch(() => null);
    return { status: response.status, headers: response.headers, data };
  };
  const jsonHeaders = { 'Content-Type': 'application/json' };

  try {
    const login = await request('/api/admin/login', { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }) });
    assert.equal(login.status, 200);
    const adminCookie = login.headers.get('set-cookie')?.split(';')[0];
    assert.ok(adminCookie);
    const adminHeaders = { cookie: adminCookie };
    const accounts = [];
    for (const fixture of fixtures) {
      const registered = await request('/api/members', { method: 'POST', headers: jsonHeaders, body: JSON.stringify(fixture) });
      assert.equal(registered.status, 201);
      const cookie = registered.headers.get('set-cookie')?.split(';')[0];
      assert.ok(cookie);
      accounts.push({ id: registered.data.member.id as string, cookie });
    }
    const [targetAccount, otherAccount] = accounts;
    const contributionBody = (fixture: typeof target, type: 'Besoin' | 'Idée') => ({ title: fixture.title, author: `${fixture.firstName} ${fixture.lastName}`, neighborhood: fixture.neighborhood, phone: fixture.phone, type, description: 'Contribution temporaire pour le test de suppression de compte.' });
    const targetContribution = await request('/api/contributions', { method: 'POST', headers: { ...jsonHeaders, cookie: targetAccount.cookie }, body: JSON.stringify(contributionBody(target, 'Idée')) });
    const otherContribution = await request('/api/contributions', { method: 'POST', headers: { ...jsonHeaders, cookie: otherAccount.cookie }, body: JSON.stringify(contributionBody(other, 'Besoin')) });
    assert.equal(targetContribution.status, 201);
    assert.equal(otherContribution.status, 201);
    await query`INSERT INTO notifications (member_id,type,title,message) VALUES (${targetAccount.id},'event',${marker},${marker}),(${otherAccount.id},'event',${marker},${marker})`;

    const path = `/api/admin/members/${targetAccount.id}`;
    for (const method of ['GET', 'DELETE']) {
      assert.equal((await request(path, { method })).status, 401, `${method} must reject anonymous requests`);
      assert.equal((await request(path, { method, headers: { cookie: targetAccount.cookie } })).status, 401, `${method} must reject member sessions`);
      assert.equal((await request('/api/admin/members/not-a-uuid', { method, headers: adminHeaders })).status, 400);
      assert.equal((await request(`/api/admin/members/${randomUUID()}`, { method, headers: adminHeaders })).status, 404);
    }

    const details = await request(path, { headers: adminHeaders });
    assert.equal(details.status, 200);
    assert.match(details.headers.get('cache-control') ?? '', /private.*no-store/);
    assert.equal(details.data.member.email, target.email);
    assert.equal(details.data.member.phone, target.phone);
    assert.equal(Object.hasOwn(details.data.member, 'passwordHash'), false);
    assert.equal(Object.hasOwn(details.data.member, 'password'), false);
    assert.equal(details.data.contributionCount, 1);
    assert.equal(details.data.ideaCount, 1);
    assert.deepEqual(details.data.contributions.map((item: { title: string }) => item.title), [target.title]);
    assert.equal(Object.hasOwn(details.data.contributions[0], 'image'), false);

    assert.equal((await request(path, { method: 'DELETE', headers: adminHeaders })).status, 200);
    assert.equal((await request(path, { headers: adminHeaders })).status, 404);
    assert.equal((await request(path, { method: 'DELETE', headers: adminHeaders })).status, 404);
    const [preserved] = await query`SELECT member_id,title FROM contributions WHERE id=${targetContribution.data.contribution.id}`;
    assert.equal(preserved.member_id, null);
    assert.equal(preserved.title, target.title);
    const [notificationCount] = await query`SELECT count(*) AS total FROM notifications WHERE member_id=${targetAccount.id}`;
    assert.equal(Number(notificationCount.total), 0);

    const remainingDetails = await request(`/api/admin/members/${otherAccount.id}`, { headers: adminHeaders });
    assert.equal(remainingDetails.status, 200);
    assert.equal(remainingDetails.data.contributionCount, 1);
    const [otherNotification] = await query`SELECT read FROM notifications WHERE member_id=${otherAccount.id} AND title=${marker}`;
    assert.equal(otherNotification.read, false);
    for (const method of ['GET', 'POST']) {
      assert.equal((await request('/api/members/notifications', { method, headers: { cookie: targetAccount.cookie } })).status, 401, 'Deleted accounts cannot keep using their old session');
    }
    assert.equal((await request('/api/contributions', { method: 'POST', headers: { ...jsonHeaders, cookie: targetAccount.cookie }, body: JSON.stringify(contributionBody(target, 'Idée')) })).status, 401);
    assert.equal((await request('/api/members/login', { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ email: target.email, password: target.password }) })).status, 401);
    const list = await request(`/api/admin/dashboard?section=members&q=${encodeURIComponent(target.email)}`, { headers: adminHeaders });
    assert.equal(list.data.total, 0);
  } finally {
    const names = fixtures.map(fixture => `${fixture.firstName} ${fixture.lastName}`);
    await query.transaction([
      query`DELETE FROM notifications WHERE member_id IN (SELECT id FROM members WHERE email IN (${target.email},${other.email})) OR message IN (${names[0] + ' vient de rejoindre le mouvement.'},${names[1] + ' vient de rejoindre le mouvement.'},${names[0] + ' a envoyé « ' + target.title + ' ».'},${names[1] + ' a envoyé « ' + other.title + ' ».'})`,
      query`DELETE FROM contributions WHERE title IN (${target.title},${other.title})`,
      query`DELETE FROM members WHERE email IN (${target.email},${other.email})`,
    ]);
    const [leftovers] = await query`SELECT (SELECT count(*) FROM members WHERE email IN (${target.email},${other.email})) + (SELECT count(*) FROM contributions WHERE title IN (${target.title},${other.title})) AS total`;
    assert.equal(Number(leftovers.total), 0, 'Temporary test records must be removed');
  }
});
