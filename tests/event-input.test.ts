import assert from 'node:assert/strict';
import test from 'node:test';
import { validateEventInput } from '../lib/event-input';

const validEvent = { date: '2028-02-29', title: '  Rencontre citoyenne  ', time: '  16h00  ', place: '  Nguinth  ', featured: true };

test('normalizes event fields and derives calendar labels from the validated date', () => {
  const result = validateEventInput({ ...validEvent, day: '01', weekday: 'faux', id: 'ignored' });
  assert.ok(result.input);
  assert.deepEqual(result.input, {
    eventDate: new Date('2028-02-29T12:00:00.000Z'), day: '29', weekday: 'mar',
    title: 'Rencontre citoyenne', time: '16h00', place: 'Nguinth', featured: true,
  });
  assert.equal(validateEventInput({ ...validEvent, featured: false }).input?.featured, false);
  const withoutFeatured: Record<string, unknown> = { ...validEvent };
  delete withoutFeatured.featured;
  assert.equal(validateEventInput(withoutFeatured).input?.featured, false);
});

test('rejects invalid event updates before writing to the database', () => {
  for (const changes of [
    { date: '2026-02-29' }, { date: '2028-02-29T00:00:00Z' }, { date: 2028 },
    { title: '' }, { title: '   ' }, { title: null }, { title: 'x'.repeat(201) },
    { time: 'x'.repeat(81) }, { place: 'x'.repeat(501) }, { place: {} },
    { featured: 'true' }, { featured: 1 }, { featured: null },
  ]) {
    assert.ok(validateEventInput({ ...validEvent, ...changes }).error, `Unexpected acceptance of ${JSON.stringify(changes)}`);
  }
  assert.ok(validateEventInput({ title: 'Incomplete event' }).error);
  assert.ok(validateEventInput({ ...validEvent, title: 'x'.repeat(200), time: 'x'.repeat(80), place: 'x'.repeat(500) }).input);
});
