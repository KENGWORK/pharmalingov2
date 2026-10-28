# Dispense Renovation Implementation Plan

> **For agentic workers:** implement task-by-task; steps use checkbox syntax. Spec: `docs/superpowers/specs/2026-10-28-dispense-renovation-design.md`.

**Goal:** Make the dispense form fast and accurate for real sigs (cc/ml doses, real periods, fewer taps).

**Architecture:** Pure sig logic in `app/sig.ts` (no imports except types, so Node can run its tests directly), UI in `DispenseForm.tsx`, strings in `dict.ts`. No change to `Prescription` fields.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, `node --test` on `.mts` files (Node 24 strips types).

## Global Constraints

- `Prescription` field names unchanged (share-link format).
- `dict.period` keeps 5 entries and the same indexes; index 1 becomes "บ่าย/Afternoon" in all 8 languages with icon 🌤️.
- Frequency list indexes: 0 วันละ 1 ครั้ง, 1 ×2, 2 ×3, 3 ×4, 4 ทุก 4-6 ชม., 5 ทุก 6 ชม., 6 ทุก 8 ชม. Period indexes: 0 เช้า, 1 บ่าย, 2 เย็น, 3 ก่อนนอน, 4 เวลามีอาการ.
- Single `cc/ml` chip stores unit key `ml`; unit `cc` still renders.
- Mismatch warning never blocks anything.
- Test files are `*.test.mts` (excluded from the Next type-check; run with `npm test`).

---

### Task 1: Sig logic with tests (TDD)

**Files:** Create `app/sig.test.mts`, `app/sig.ts`; modify `package.json` (`"test": "node --test app/*.test.mts"`).

**Interfaces (produces):**
- `DOSE_UNITS: { key: string; label: string }[]` (tab, cap, ml, tsp, tbsp, puff, drop; labels Thai)
- `DOSE_PRESETS: Record<string, number[]>`
- `doseLabel(n: number, unit: string): string` — ½ / 1½ / 2½ for tab, cap, tsp, tbsp; plain number otherwise
- `PATTERNS: { label: string; periods: number[]; freq: number }[]`
- `autoFreq(periodCount: number): number | null` — 1..4 → 0..3, else null
- `nextFreqForPeriods(rxFreq: number | null, oldPeriods: number[], newPeriods: number[]): number | null`
- `freqMismatch(rxFreq: number | null, periodCount: number): boolean`
- `summaryParts(rx, th, unitTh): { text: string; missing?: boolean }[]`

- [ ] Step 1: write `sig.test.mts` covering: `autoFreq(0..5)`; `nextFreqForPeriods` follows when freq is null or equal to the old auto value, keeps a manual `วันละ 2 ครั้ง`/interval frequency; `freqMismatch` true only for manual `วันละ N` with a different non-zero count; `doseLabel(0.5,'tab')==='½'`, `doseLabel(1.5,'tsp')==='1½'`, `doseLabel(2.5,'ml')==='2.5'`; each pattern's `freq === autoFreq(periods.length)`; `summaryParts` for 7 ml / วันละ 1 ครั้ง / ก่อนนอน, for an empty rx (3 missing parts) and for a tapering rx.
- [ ] Step 2: `npm test` — expect FAIL (cannot find `./sig.ts`).
- [ ] Step 3: implement `sig.ts`.
- [ ] Step 4: `npm test` — expect PASS.

### Task 2: Period strings

**Files:** modify `app/dict.ts`. Replace index 1 of `period` in th/en/de/fr/zh/ja/ru/ar with บ่าย / Afternoon / Nachmittags / Après-midi / 下午 / 午後 / После обеда / بعد الظهر, and `🕛` → `🌤️` in every `period_icons`.

- [ ] Verify with a grep that no old "กลางวัน", "Noon", "Mittags", "Midi", "中午", "昼", "Днем", "ظهر" remain in the period arrays; `npm run build`.

### Task 3: DispenseForm

**Files:** modify `app/components/DispenseForm.tsx`; touch `app/components/controls.tsx` only if `ChipRow` needs a prop.

- [ ] Order: sticky summary → drug block → taper toggle → (taper UI | dose → patterns + periods + frequency (+ mismatch) → meal → "เพิ่มเติม") → indication → warnings.
- [ ] Dose: unit chips (`DOSE_UNITS`, `cc` shown as selected `ml`) then number chips (`DOSE_PRESETS[unit]` via `doseLabel`) then `…อื่นๆ` inline numeric field (open when the value isn't a preset); picking sets `cDose`, `cDoseUnit`, `rxDose: null`.
- [ ] Periods: pattern buttons set `rxPeriod` + `rxFreq`; period toggles use `nextFreqForPeriods`; frequency chip still clears `cHour`/`cApply`.
- [ ] Summary bar from `summaryParts`, missing parts in amber.
- [ ] "เพิ่มเติม" panel keeps `ทุกๆ n ชม.`, `ทาวันละ n`, `ติดต่อกัน n วัน`.

### Task 4: Verify and document

- [ ] `npm run lint`, `npm test`, `npm run build` all clean.
- [ ] Browser checklist from the spec (items 1–7) on a Vercel preview at 440×956.
- [ ] Update `CLAUDE.md` (commands, `sig.ts`, period meaning).
