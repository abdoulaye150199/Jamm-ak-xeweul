import assert from 'node:assert/strict';
import test from 'node:test';
import { hasRequiredStrings, isUuid, parseEventDate, parsePositiveInteger, readJsonObject } from '../lib/request-validation';

test('rejects malformed JSON and non-object request bodies', async () => {
  for (const body of ['{', 'null', '[]', '"text"', '42', 'true', '']) {
    const request = new Request('http://localhost/api/members', { method: 'POST', body });
    assert.equal(await readJsonObject(request), null, `Unexpected acceptance of ${body}`);
  }
  const request = new Request('http://localhost/api/members', { method: 'POST', body: '{"firstName":"Awa"}' });
  assert.deepEqual(await readJsonObject(request), { firstName: 'Awa' });
});

test('rejects missing, blank and incorrectly typed required fields', () => {
  for (const firstName of [undefined, null, 42, [], {}, '', '   ']) {
    assert.equal(hasRequiredStrings({ firstName }, ['firstName']), false);
  }
  assert.equal(hasRequiredStrings({ firstName: 'Awa', lastName: 'Fall' }, ['firstName', 'lastName']), true);
});

test('keeps invalid pagination values out of database queries', () => {
  for (const value of [null, '', 'abc', 'Infinity', 'NaN', '-1', '0', '1.5', '1e100']) {
    assert.equal(parsePositiveInteger(value, 8, 50), 8, `Unexpected pagination for ${value}`);
  }
  assert.equal(parsePositiveInteger('2', 1), 2);
  assert.equal(parsePositiveInteger('100', 8, 50), 50);
});

test('rejects malformed contribution identifiers before querying PostgreSQL', () => {
  assert.equal(isUuid('not-a-uuid'), false);
  assert.equal(isUuid(''), false);
  assert.equal(isUuid('12345678-1234-1234-1234-123456789abc'), true);
});

test('rejects impossible event dates instead of publishing them on a different day', () => {
  for (const value of ['2026-02-29', '2026-02-30', '2026-04-31', '2026-13-01', '2026-00-01', '2026-10-00', '2026-1-1', 'invalid', '2026-10-21T12:00:00']) {
    assert.equal(parseEventDate(value), null, `Unexpected event date for ${value}`);
  }
  assert.equal(parseEventDate('2024-02-29')?.toISOString(), '2024-02-29T12:00:00.000Z');
  assert.equal(parseEventDate('2026-10-21')?.toISOString(), '2026-10-21T12:00:00.000Z');
});
