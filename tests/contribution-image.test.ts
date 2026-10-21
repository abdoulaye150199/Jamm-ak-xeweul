import assert from 'node:assert/strict';
import test from 'node:test';
import { getContributionImageError } from '../lib/contribution-image';

test('allows optional photos and supported raster images', () => {
  assert.equal(getContributionImageError(null), null);
  assert.equal(getContributionImageError(undefined), null);
  for (const type of ['png', 'jpeg', 'webp', 'gif']) assert.equal(getContributionImageError(`data:image/${type};base64,AQID`), null);
});

test('rejects non-images and malformed base64 attachments', () => {
  for (const value of [42, {}, '', 'https://example.com/image.png', 'data:image/svg+xml;base64,AQID', 'data:image/png;base64,', 'data:image/png;base64,%%%%', 'data:image/png;base64,AQ=']) {
    assert.notEqual(getContributionImageError(value), null);
  }
});

test('accepts exactly 1.5 MB and rejects larger files, including the data URI header', () => {
  assert.equal(getContributionImageError(`data:image/jpeg;base64,${Buffer.alloc(1_500_000).toString('base64')}`), null);
  assert.notEqual(getContributionImageError(`data:image/jpeg;base64,${Buffer.alloc(1_500_001).toString('base64')}`), null);
});
