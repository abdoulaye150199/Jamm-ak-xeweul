import assert from 'node:assert/strict';
import test from 'node:test';
import { createMemberSessionToken, getMemberIdFromSession, hashMemberPassword, verifyMemberPassword } from '../lib/member-auth';
import { checkRateLimit } from '../lib/rate-limit';

process.env.ADMIN_SESSION_SECRET = 'test-only-session-secret';

test('hashes and verifies member passwords without storing the clear password', () => {
  const password = 'correct-password-123';
  const hash = hashMemberPassword(password);
  assert.notEqual(hash, password);
  assert.equal(verifyMemberPassword(password, hash), true);
  assert.equal(verifyMemberPassword('wrong-password', hash), false);
});

test('creates a verifiable member session token', () => {
  const token = createMemberSessionToken('member-123');
  assert.equal(getMemberIdFromSession(token), 'member-123');
  assert.equal(getMemberIdFromSession(`${token}tampered`), null);
});

test('blocks repeated login attempts during the configured window', () => {
  const key = `test-${Date.now()}`;
  for (let attempt = 0; attempt < 5; attempt += 1) assert.equal(checkRateLimit(key).allowed, true);
  const blocked = checkRateLimit(key);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfter > 0);
});
