import test from 'node:test';
import assert from 'node:assert/strict';
import { clampStep, ease, loopPhase, overlayFor, pulse, sceneFor, segment } from './anim.ts';

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} !~ ${b}`);

test('clampStep keeps the step inside 0..count-1', () => {
  assert.equal(clampStep(-3, 5), 0);
  assert.equal(clampStep(2, 5), 2);
  assert.equal(clampStep(9, 5), 4);
  assert.equal(clampStep(1, 0), 0); // no steps: stay at 0
});

test('loopPhase wraps elapsed time into 0..1 for a looping animation', () => {
  close(loopPhase(0, 4), 0);
  close(loopPhase(1, 4), 0.25);
  close(loopPhase(4, 4), 0);
  close(loopPhase(9, 4), 0.25);
  close(loopPhase(-1, 4), 0.75);
});

test('segment maps a window of the phase to 0..1 and clamps outside it', () => {
  assert.equal(segment(0.1, 0.2, 0.6), 0);
  close(segment(0.4, 0.2, 0.6), 0.5);
  assert.equal(segment(0.9, 0.2, 0.6), 1);
});

test('ease is a smooth 0..1 curve with fixed ends and midpoint', () => {
  assert.equal(ease(0), 0);
  assert.equal(ease(1), 1);
  close(ease(0.5), 0.5);
  assert.ok(ease(0.25) < 0.25 && ease(0.75) > 0.75);
  assert.equal(ease(-1), 0);
  assert.equal(ease(2), 1);
});

test('pulse rises to 1 in the middle of its window and is 0 outside it', () => {
  assert.equal(pulse(0.1, 0.2, 0.6), 0);
  close(pulse(0.4, 0.2, 0.6), 1);
  assert.equal(pulse(0.7, 0.2, 0.6), 0);
});

test('sceneFor picks the 3D scene by guide id', () => {
  assert.equal(sceneFor('inhaler_mdi'), 'mdi');
  assert.equal(sceneFor('insulin_pen'), 'pen');
  assert.equal(sceneFor('something_else'), null);
});

test('overlayFor labels only the steps where a number matters', () => {
  assert.equal(overlayFor('mdi', 3), '10 s'); // hold your breath
  assert.equal(overlayFor('pen', 3), '90°'); // inject straight in
  assert.equal(overlayFor('pen', 4), '10 s'); // hold before removing
  assert.equal(overlayFor('mdi', 0), null);
  assert.equal(overlayFor('pen', 1), null);
});
