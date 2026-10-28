# Dispense tab renovation — design

Date: 2026-10-28 · Scope: the `จ่ายยา` (dispense) input form in `app/components/DispenseForm.tsx` and the strings it uses. Patient-facing cards keep their layout.

## Problems (from the pharmacist)

1. Real sigs can't be entered quickly: there is no dose button in cc/ml, so "7 cc once a day at bedtime" or "3 cc three times a day, morning / afternoon / bedtime" means opening the hidden numeric panel and tapping `+` in 0.5 steps (14 taps for 7 cc) or typing.
2. The period chips don't match real use: `เช้า / กลางวัน / เย็น / ก่อนนอน / เวลามีอาการ` has no "บ่าย".
3. Too many taps per drug, and nothing tells the pharmacist if the frequency and the chosen periods disagree.

## Decisions

- Approach A: fix the existing form (units/numbers, periods, summary, order). No shorthand parser, no per-row schedule builder.
- No "recent sigs" row, nothing stored on the device.
- No change to the data model: all fields on `Prescription` keep their names and meaning, so old `?rx=` share links and carts keep working.

## Design

### 1. Dose = unit row + number row (replaces the dose chips and the "ใช้ครั้งละ" smart row)

Unit chips (first): `เม็ด` `แคปซูล` `cc/ml` `ช้อนชา` `ช้อนโต๊ะ` `กด` `หยด`. Number chips (second row, depend on the unit):

| Unit | Number chips |
|---|---|
| เม็ด, แคปซูล | ½ · 1 · 1½ · 2 · 3 |
| cc/ml | 2.5 · 5 · 7.5 · 10 · 15 |
| ช้อนชา | ½ · 1 · 1½ · 2 |
| ช้อนโต๊ะ | ½ · 1 · 2 |
| กด | 1 · 2 · 3 |
| หยด | 1 · 2 · 3 · 5 |

Every unit also has `…อื่นๆ`, which opens an inline numeric field (`inputMode="decimal"`) for any value (7 cc = tap `cc/ml`, tap `…`, type 7).

- Stored in `cDose` + `cDoseUnit` (existing). The single `cc/ml` chip stores unit key `ml` (patients abroad read "ml"); `cc` stays in `unitDict` so older data that used it still renders.
- `rxDose` (the old fixed dose chips) is no longer set by the form. `BoardingPass` and `rxSpeechText` still render it, so old shared links display correctly. Picking a number clears `rxDose`.
- The remaining smart rows (`ทุกๆ n ชม.`, `ทาวันละ n`, `ติดต่อกัน n วัน`) stay in the collapsible panel, now titled "เพิ่มเติม".

### 2. Periods and frequency

- `dict.period` index 1 changes from "กลางวัน/Noon" to "บ่าย/Afternoon" in all 8 languages, with its icon (`🕛` → `🌤️`). The index stays the same, so no data migration; an old shared link that had "noon" will read "afternoon".
- Pattern buttons above the period chips, one tap each, set periods and frequency together and stay editable: `ก่อนนอน` (1×) · `เช้า–เย็น` (2×) · `เช้า–บ่าย–เย็น` (3×) · `เช้า–บ่าย–เย็น–ก่อนนอน` (4×).
- Automatic frequency: while the pharmacist has not tapped a frequency chip themselves, `rxFreq` follows the number of selected periods (1–4 → `วันละ N ครั้ง`; 0 or >4 → none). Tapping a frequency chip makes it manual and stops the automation for that prescription.
- Mismatch warning (yellow text, never blocks anything): frequency is manual `วันละ N ครั้ง` and the selected period count is not N. Interval frequencies (`ทุก 4–6 / 6 / 8 ชม.`) never warn.
- Meal timing (`ก่อน / หลัง / หลังทันที / ก่อนหรือหลัง`) stays a single choice.

### 3. Sticky summary bar

At the top of the form, always visible while scrolling: one line built from the current fields, e.g. `Amoxicillin · 7 cc · วันละ 1 ครั้ง · หลังอาหาร · ก่อนนอน`. Required parts not yet filled show as yellow placeholders: drug, dose (number + unit), frequency or period. Indication, meal timing and warnings are optional and not flagged. Taper mode shows `โหมดลดโดส · n ช่วง` instead.

### 4. Order of the form

Drug → dose → frequency / periods (+ pattern buttons) → meal timing → "เพิ่มเติม" panel → indication → warnings. The taper toggle stays directly under the drug block as today.

## Out of scope

Recent / favourite sigs, shorthand typing (`7cc hs`), per-row dose schedules, changes to the boarding-pass layout, new drugs in `drugData`, translation of indications and warnings.

## Files touched

- `app/dict.ts` — period index 1 text/icon in 8 languages; unit labels for the new chips if needed.
- `app/components/DispenseForm.tsx` — dose rows, pattern buttons, auto frequency, warning, summary bar, new order.
- `app/components/controls.tsx` — reuse `ChipRow`; a small `NumberField` for `…อื่นๆ` if `Stepper` doesn't fit.
- `app/speech.ts`, `app/components/BoardingPass.tsx` — no logic change expected (they already read `cDose` + `cDoseUnit`).

## Verification (no test runner in this repo)

Manual checklist at 440×956, plus a Vercel preview on iPhone:

1. 7 cc once daily at bedtime: ≤ 3 taps after the drug (unit, `…` + type 7, `ก่อนนอน` pattern).
2. 3 cc three times daily after meals, morning / afternoon / bedtime: dose chips + periods; frequency shows `วันละ 3 ครั้ง` by itself.
3. Tablets: `เม็ด` → `1` → `เช้า–บ่าย–เย็น` gives "1 tablet · 3 times a day".
4. Manual frequency `วันละ 2 ครั้ง` with 3 periods shows the yellow warning; `ทุก 8 ชม.` with 3 periods does not.
5. Boarding pass and spoken text read correctly in at least en, ja, ar for the cases above; "Afternoon" appears for index 1 in every language.
6. An old share link (fixed dose chip + "noon") still opens.
7. `npm run lint` and `npm run build` stay clean.
