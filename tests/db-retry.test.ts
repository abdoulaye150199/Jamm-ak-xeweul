import assert from 'node:assert/strict';
import test from 'node:test';
import { isTransientDatabaseError, readDatabase } from '../lib/db-retry';

test('recovers a database read after a temporary connection failure', async () => {
  let attempts = 0;
  const delays: number[] = [];
  const value = await readDatabase(async () => {
    attempts += 1;
    if (attempts < 3) throw new Error('Failed query', { cause: { sourceError: { code: 'ETIMEDOUT' } } });
    return 'result';
  }, async delay => { delays.push(delay); });
  assert.equal(value, 'result');
  assert.equal(attempts, 3);
  assert.deepEqual(delays, [200, 400]);
});

test('stops retrying after three failed database reads', async () => {
  let attempts = 0;
  const error = Object.assign(new Error('Connection reset'), { code: 'ECONNRESET' });
  await assert.rejects(readDatabase(async () => { attempts += 1; throw error; }, async () => {}), error);
  assert.equal(attempts, 3);
});

test('does not retry invalid SQL or constraint errors', async () => {
  for (const code of ['23505', '42P01', '22P02']) {
    let attempts = 0;
    const error = Object.assign(new Error('Query rejected'), { code });
    await assert.rejects(readDatabase(async () => { attempts += 1; throw error; }, async () => {}), error);
    assert.equal(attempts, 1);
  }
});

test('finds nested HTTP and aggregate network errors without looping on circular causes', () => {
  assert.equal(isTransientDatabaseError({ cause: { sourceError: new TypeError('fetch failed') } }), true);
  assert.equal(isTransientDatabaseError(new AggregateError([{ code: 'ETIMEDOUT' }])), true);
  const circular: { cause?: unknown } = {};
  circular.cause = circular;
  assert.equal(isTransientDatabaseError(circular), false);
});
