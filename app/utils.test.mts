import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeShare, encodeShare, isDecimal, isInteger, toggle } from './utils.ts';

// '>>>' and '???' encode to base64 'Pj4+' and 'Pz8/', so a run of each guarantees '+' and '/' in the output
const trickyCart = [{ customWarnings: ['>>>>>>>>>>>>', '????????????', 'ก่อนนอน 🚨'] }] as never;
const payload = { cart: trickyCart, lang: 'ja' as const };

// What happens to a link when someone opens it: the browser parses the query string
const throughUrl = (rx: string) => new URLSearchParams('?rx=' + rx).get('rx') as string;

test('the raw base64 of the test payload really contains + and / (guards the test itself)', () => {
  const raw = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  assert.match(raw, /\+/);
  assert.match(raw, /\//);
});

test('share links survive being used as a ?rx= query value', () => {
  assert.deepEqual(decodeShare(throughUrl(encodeShare(payload))), payload);
});

test('encoded links only use URL-safe characters', () => {
  assert.match(encodeShare(payload), /^[A-Za-z0-9_-]+$/);
});

test('links already handed out in the old format still open (+ arrived as a space)', () => {
  const oldFormat = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  assert.deepEqual(decodeShare(throughUrl(oldFormat)), payload);
});

test('garbage input decodes to null instead of throwing', () => {
  assert.equal(decodeShare('not a valid link!!'), null);
  assert.equal(decodeShare(''), null);
});

test('toggle adds a missing value and removes a present one', () => {
  assert.deepEqual(toggle([1, 2], 3), [1, 2, 3]);
  assert.deepEqual(toggle([1, 2, 3], 2), [1, 3]);
});

test('numeric typing guards', () => {
  assert.ok(isDecimal('') && isDecimal('7') && isDecimal('7.5') && isDecimal('.5'));
  assert.ok(!isDecimal('7a') && !isDecimal('1.2.3'));
  assert.ok(isInteger('') && isInteger('12') && !isInteger('1.5'));
});
