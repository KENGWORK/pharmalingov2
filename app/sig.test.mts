import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DOSE_PRESETS, DOSE_UNITS, PATTERNS, autoFreq, doseIconKind, doseLabel, freqMismatch, nextFreqForPeriods, summaryParts,
} from './sig.ts';

const th = {
  dose: [],
  freq: ['วันละ 1 ครั้ง', 'วันละ 2 ครั้ง', 'วันละ 3 ครั้ง', 'วันละ 4 ครั้ง', 'ทุก 4-6 ชม.', 'ทุก 6 ชม.', 'ทุก 8 ชม.'],
  time: ['ก่อนอาหาร', 'หลังอาหาร', 'หลังอาหารทันที', 'ก่อนหรือหลังอาหารก็ได้'],
  period: ['เช้า', 'บ่าย', 'เย็น', 'ก่อนนอน', 'เวลามีอาการ'],
};
const unitTh = { ml: 'มล. (ml)', tab: 'เม็ด' };

type Rx = Parameters<typeof summaryParts>[0];
const emptyRx = (): Rx => ({
  drugInput: '', isTapering: false, taperSteps: [],
  rxDose: null, rxFreq: null, rxTime: null, rxPeriod: [],
  cDose: 0, cDoseUnit: 'tab', cHour: 0, cApply: 0,
});

test('autoFreq maps 1-4 periods to วันละ 1-4 ครั้ง and nothing else', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(autoFreq), [null, 0, 1, 2, 3, null]);
});

test('nextFreqForPeriods follows the period count unless the frequency was set by hand', () => {
  assert.equal(nextFreqForPeriods(null, [], [0]), 0);
  assert.equal(nextFreqForPeriods(1, [0, 2], [0, 1, 2]), 2); // was auto (2 periods -> ×2), follows
  assert.equal(nextFreqForPeriods(2, [0, 1, 2], [0, 1]), 1);
  assert.equal(nextFreqForPeriods(2, [0, 1, 2], []), null); // all periods removed
  assert.equal(nextFreqForPeriods(1, [], [0, 1, 2]), 1); // manual ×2 stays
  assert.equal(nextFreqForPeriods(6, [0, 2], [0, 1, 2]), 6); // interval frequency stays
});

test('freqMismatch only flags a manual วันละ N that disagrees with the periods', () => {
  assert.equal(freqMismatch(1, 3), true);
  assert.equal(freqMismatch(2, 3), false);
  assert.equal(freqMismatch(1, 0), false);
  assert.equal(freqMismatch(null, 3), false);
  assert.equal(freqMismatch(6, 3), false); // ทุก 8 ชม. never warns
});

test('patterns set a frequency that matches their period count', () => {
  assert.equal(PATTERNS.length, 4);
  for (const p of PATTERNS) assert.equal(p.freq, autoFreq(p.periods.length), p.label);
  assert.deepEqual(PATTERNS[0].periods, [3]); // ก่อนนอน
});

test('doseLabel uses fractions for countable units and plain numbers for volume', () => {
  assert.equal(doseLabel(0.5, 'tab'), '½');
  assert.equal(doseLabel(1.5, 'tsp'), '1½');
  assert.equal(doseLabel(2, 'tab'), '2');
  assert.equal(doseLabel(2.5, 'ml'), '2.5');
  assert.equal(doseLabel(7.5, 'ml'), '7.5');
});

test('every dose unit has presets and a Thai label', () => {
  for (const u of DOSE_UNITS) {
    assert.ok(DOSE_PRESETS[u.key]?.length >= 3, u.key);
    assert.ok(u.label.length > 0);
  }
  assert.deepEqual(DOSE_PRESETS.ml, [2.5, 5, 7.5, 10, 15]);
});

test('summary line for "7 ml once a day after meals at bedtime"', () => {
  const rx = { ...emptyRx(), drugInput: 'Amoxicillin', cDose: 7, cDoseUnit: 'ml', rxFreq: 0, rxTime: 1, rxPeriod: [3] };
  const parts = summaryParts(rx, th, unitTh);
  assert.deepEqual(parts.map(p => p.text), ['Amoxicillin', '7 มล. (ml)', 'วันละ 1 ครั้ง', 'หลังอาหาร', 'ก่อนนอน']);
  assert.ok(parts.every(p => !p.missing));
});

test('summary of an empty form lists the three required parts as missing', () => {
  const parts = summaryParts(emptyRx(), th, unitTh);
  assert.deepEqual(parts, [
    { text: 'ระบุยา', missing: true },
    { text: 'ขนาดยา', missing: true },
    { text: 'ความถี่/ช่วงเวลา', missing: true },
  ]);
});

test('periods alone satisfy the frequency/period requirement; intervals count too', () => {
  const periodsOnly = summaryParts({ ...emptyRx(), drugInput: 'X', cDose: 1, rxPeriod: [0, 2] }, th, unitTh);
  assert.ok(periodsOnly.every(p => !p.missing));
  assert.ok(periodsOnly.some(p => p.text === 'เช้า เย็น'));
  const interval = summaryParts({ ...emptyRx(), drugInput: 'X', cDose: 1, cHour: 8 }, th, unitTh);
  assert.ok(interval.some(p => p.text === 'ทุก 8 ชม.'));
  assert.ok(interval.every(p => !p.missing));
});

test('tapering shows a single taper part instead of dose/frequency', () => {
  const rx = { ...emptyRx(), drugInput: 'Prednisolone', isTapering: true, taperSteps: [{}, {}] as unknown as Rx['taperSteps'] };
  assert.deepEqual(summaryParts(rx, th, unitTh).map(p => p.text), ['Prednisolone', 'โหมดลดโดส · 2 ช่วง']);
});

test('a legacy dose chip (rxDose) still counts as a dose', () => {
  const thLegacy = { ...th, dose: ['ครึ่งเม็ด', '1 เม็ด'] };
  const parts = summaryParts({ ...emptyRx(), drugInput: 'X', rxDose: 1, rxPeriod: [0] }, thLegacy, unitTh);
  assert.ok(parts.some(p => p.text === '1 เม็ด'));
});

test('dose icon: syringe for liquid up to 15 ml, measuring cup above, pill otherwise', () => {
  const dose = (cDose: number | string, cDoseUnit: string, rxDose: number | null = null) => ({ cDose, cDoseUnit, rxDose });
  assert.equal(doseIconKind(dose(5, 'ml')), 'syringe');
  assert.equal(doseIconKind(dose(0.5, 'ml')), 'syringe');
  assert.equal(doseIconKind(dose(15, 'ml')), 'syringe'); // 15 is still a syringe, only above 15 is a cup
  assert.equal(doseIconKind(dose(15.5, 'ml')), 'cup');
  assert.equal(doseIconKind(dose(30, 'ml')), 'cup');
  assert.equal(doseIconKind(dose('7.5', 'cc')), 'syringe'); // older 'cc' key and string values from the text field
  assert.equal(doseIconKind(dose(20, 'cc')), 'cup');
  assert.equal(doseIconKind(dose(2, 'tab')), 'pill');
  assert.equal(doseIconKind(dose(1, 'tsp')), 'pill'); // spoons are not covered by this rule
  assert.equal(doseIconKind(dose(0, 'ml')), 'pill'); // no number entered yet
  assert.equal(doseIconKind(dose(0, 'tab', 1)), 'pill'); // legacy fixed dose chip
});
