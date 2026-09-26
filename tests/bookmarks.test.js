import assert from 'node:assert/strict';
import test from 'node:test';
import { formatBookmark, generateSlug, loadBookmarks, normalizeUrl } from '../src/lib/bookmarks.js';

test('normalizes URLs with and without https to the same saved value', () => {
  assert.equal(normalizeUrl('https://www.example.com'), 'https://www.example.com/');
  assert.equal(normalizeUrl('www.example.com'), 'https://www.example.com/');
  assert.equal(normalizeUrl('  https://www.example.com  '), 'https://www.example.com/');
  assert.equal(normalizeUrl('example.com:8080/path'), 'https://example.com:8080/path');
  assert.equal(normalizeUrl('//www.example.com/path'), 'https://www.example.com/path');
});

test('generates a short base62 slug with the mona- prefix', () => {
  assert.match(generateSlug(), /^mona-[0-9a-zA-Z]{6}$/);
});

test('recovers from empty, corrupted, legacy, and non-array storage values', () => {
  for (const value of [null, '', '[]', 'not json', '"legacy value"', '42', '{}']) {
    assert.deepEqual(loadBookmarks(value), []);
  }

  assert.deepEqual(
    loadBookmarks(JSON.stringify([
      { url: 'https://valid.example', slug: 'mona-7fk2' },
      'legacy entry',
      { url: 'https://missing-slug.example' },
      { url: 'javascript:alert(1)', slug: 'mona-abcd' },
      { url: 'https://bad-slug.example', slug: 'legacy' },
    ])),
    [{ url: 'https://valid.example/', slug: 'mona-7fk2' }],
  );
});

test('formats a saved bookmark with the exact visible separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com/', slug: 'mona-7fk2' }),
    'https://www.example.com/ :: mona-7fk2',
  );
});
