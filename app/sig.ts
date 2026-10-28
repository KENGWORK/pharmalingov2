// Pure helpers for the dispense form's "sig" (dose / frequency / time of day).
// No runtime imports on purpose: `npm test` runs sig.test.mts straight on this file with Node.
import type { Prescription } from './dict';

// Dose units offered as chips. 'cc/ml' stores unit key 'ml'; the old 'cc' key still renders elsewhere.
export const DOSE_UNITS = [
  { key: 'tab', label: 'เม็ด' },
  { key: 'cap', label: 'แคปซูล' },
  { key: 'ml', label: 'cc/ml' },
  { key: 'tsp', label: 'ช้อนชา' },
  { key: 'tbsp', label: 'ช้อนโต๊ะ' },
  { key: 'puff', label: 'กด' },
  { key: 'drop', label: 'หยด' },
];

export const DOSE_PRESETS: Record<string, number[]> = {
  tab: [0.5, 1, 1.5, 2, 3],
  cap: [0.5, 1, 1.5, 2, 3],
  ml: [2.5, 5, 7.5, 10, 15],
  tsp: [0.5, 1, 1.5, 2],
  tbsp: [0.5, 1, 2],
  puff: [1, 2, 3],
  drop: [1, 2, 3, 5],
};

const FRACTION_UNITS = ['tab', 'cap', 'tsp', 'tbsp'];

// ½ and 1½ for things you count or spoon out; plain decimals for volumes
export const doseLabel = (n: number, unit: string): string => {
  if (!FRACTION_UNITS.includes(unit) || n % 1 !== 0.5) return String(n);
  return n < 1 ? '½' : `${Math.floor(n)}½`;
};

export type DoseIconKind = 'pill' | 'syringe' | 'cup';

// Icon on the boarding pass dose row: liquids measured in ml/cc get a syringe, and a measuring cup
// above 15 ml (too much for a syringe); everything else, including spoons, keeps the pill.
export const doseIconKind = (rx: Pick<Prescription, 'cDose' | 'cDoseUnit' | 'rxDose'>): DoseIconKind => {
  const volume = Number(rx.cDose);
  if (!(volume > 0) || (rx.cDoseUnit !== 'ml' && rx.cDoseUnit !== 'cc')) return 'pill';
  return volume > 15 ? 'cup' : 'syringe';
};

// Indexes: periods 0 เช้า, 1 บ่าย, 2 เย็น, 3 ก่อนนอน · frequencies 0-3 = วันละ 1-4 ครั้ง
export const PATTERNS = [
  { label: 'ก่อนนอน', periods: [3], freq: 0 },
  { label: 'เช้า–เย็น', periods: [0, 2], freq: 1 },
  { label: 'เช้า–บ่าย–เย็น', periods: [0, 1, 2], freq: 2 },
  { label: 'เช้า–บ่าย–เย็น–ก่อนนอน', periods: [0, 1, 2, 3], freq: 3 },
];

// "วันละ N ครั้ง" implied by N selected periods (1-4), otherwise nothing
export const autoFreq = (periodCount: number): number | null =>
  periodCount >= 1 && periodCount <= 4 ? periodCount - 1 : null;

// The frequency follows the period count while it was empty or still the automatic value for the old
// periods; a frequency the pharmacist picked by hand (or an interval like ทุก 8 ชม.) is left alone.
export const nextFreqForPeriods = (rxFreq: number | null, oldPeriods: number[], newPeriods: number[]): number | null => {
  const followsPeriods = rxFreq === null || rxFreq === autoFreq(oldPeriods.length);
  return followsPeriods ? autoFreq(newPeriods.length) : rxFreq;
};

// Manual "วันละ N ครั้ง" that disagrees with how many periods are ticked (interval frequencies never do)
export const freqMismatch = (rxFreq: number | null, periodCount: number): boolean =>
  rxFreq !== null && rxFreq <= 3 && periodCount > 0 && periodCount !== rxFreq + 1;

type SigRx = Pick<Prescription, 'drugInput' | 'isTapering' | 'taperSteps' | 'rxDose' | 'rxFreq' | 'rxTime' | 'rxPeriod' | 'cDose' | 'cDoseUnit' | 'cHour' | 'cApply'>;
type SigStrings = { dose: string[]; freq: string[]; time: string[]; period: string[] };
export type SummaryPart = { text: string; missing?: boolean };

// One-line summary shown above the form; missing required parts come back flagged
export const summaryParts = (rx: SigRx, th: SigStrings, unitTh: Record<string, string>): SummaryPart[] => {
  const drug = rx.drugInput.trim();
  const parts: SummaryPart[] = [drug ? { text: drug } : { text: 'ระบุยา', missing: true }];

  if (rx.isTapering) {
    parts.push({ text: `โหมดลดโดส · ${rx.taperSteps.length} ช่วง` });
    return parts;
  }

  if (Number(rx.cDose) > 0) parts.push({ text: `${Number(rx.cDose)} ${unitTh[rx.cDoseUnit] ?? rx.cDoseUnit}` });
  else if (rx.rxDose !== null) parts.push({ text: th.dose[rx.rxDose] });
  else parts.push({ text: 'ขนาดยา', missing: true });

  const hasPeriods = rx.rxPeriod.length > 0;
  const frequency: SummaryPart[] = [];
  if (rx.rxFreq !== null) frequency.push({ text: th.freq[rx.rxFreq] });
  if (Number(rx.cHour) > 0) frequency.push({ text: `ทุก ${Number(rx.cHour)} ชม.` });
  if (Number(rx.cApply) > 0) frequency.push({ text: `ทาวันละ ${Number(rx.cApply)} ครั้ง` });
  if (frequency.length === 0 && !hasPeriods) parts.push({ text: 'ความถี่/ช่วงเวลา', missing: true });
  else parts.push(...frequency);

  if (rx.rxTime !== null) parts.push({ text: th.time[rx.rxTime] });
  if (hasPeriods) parts.push({ text: rx.rxPeriod.map(i => th.period[i]).join(' ') });
  return parts;
};
