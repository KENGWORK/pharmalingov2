# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build (also type-checks)
npm run start    # Start production server
npm run lint     # Run ESLint (flat config, eslint.config.mjs) — currently clean
npm test         # node --test app/*.test.mts (Node 24 runs the TypeScript directly, no dependencies)
```

The automated tests cover the pure logic only: `app/sig.ts`, `app/anim.ts` and `app/utils.ts` (share-link encoding, `toggle`, input guards); UI is checked by hand in the browser. Single test file: `node --test app/sig.test.mts`. Test files are `.mts` and import `./sig.ts` with the extension (`allowImportingTsExtensions` is on in `tsconfig.json` for that); `sig.ts` must keep runtime imports out so Node can load it. README.md is a one-line placeholder.

## Architecture

**Single-page Next.js 16 app** (App Router, React 19, Tailwind v4, TypeScript) for pharmacists dispensing to foreign-language patients. No backend and no API routes; everything runs client-side.

- [`app/page.tsx`](app/page.tsx) — the only page (`'use client'`): app state, handlers, the language picker, the patient panel and the pharmacist shell. Everything else is imported.
- [`app/dict.ts`](app/dict.ts) — UI strings (`dict`, `unitDict`), `Lang`, `LANGUAGES`, the `Prescription` / `TaperStep` types and `emptyRx()`, `fillTemplate()`.
- [`app/sig.ts`](app/sig.ts) — pure helpers for the dispense form: dose units/presets, period patterns, `autoFreq` / `nextFreqForPeriods` / `freqMismatch`, `summaryParts` (the sticky summary line) and `doseIconKind` (boarding-pass dose icon: oral syringe for ml/cc up to 15, measuring cup above 15, pill otherwise; both liquid icons are SVGs in `components/DoseIcon.tsx` — never use the 💉 emoji, it has a needle and these are oral medicines). Tested by `sig.test.mts`.
- [`app/anim.ts`](app/anim.ts) — pure helpers for the 3D guides (`sceneFor`, `clampStep`, `loopPhase`, `segment`, `ease`, `pulse`, `overlayFor`). Tested by `anim.test.mts`; keep it import-free like `sig.ts`.
- [`app/components/guide3d/`](app/components/guide3d) — the "เทคนิคพิเศษ" 3D teaching scenes (three.js via `@react-three/fiber`): `GuideStage` (canvas, camera shots per step, drag-to-turn, double-tap reset), `MdiScene` and `PenScene` (models built from primitives, animated per step in `useFrame` from `useStepPhase`), `parts.tsx` (air arrows, 10 s countdown ring). `GuideCard` loads it with `next/dynamic` (`ssr: false`) so three.js is only downloaded when a guide opens, and falls back to the plain step list when WebGL is missing or the device asks for reduced motion. Adding a guide scene means: a new `SceneKind` + `sceneFor` entry, a scene component, and a `SHOTS` row per step in `GuideStage`. Step text and icons still come from `specialData`.
- [`app/components/`](app/components) — `DispenseForm` (the whole prescription form, owns its own input/busy state; `page.tsx` gives it a `key` so it remounts whenever the prescription is reset), `BoardingPass` and `GuideCard` (patient-facing cards, `memo`), `controls.tsx` (`ChipRow`, `Stepper`).
- [`app/speech.ts`](app/speech.ts) — browser TTS (`speak`, voice picking) and the spoken-text builders (`rxSpeechText`, `warningsSpeechText`).
- [`app/utils.ts`](app/utils.ts) — `translateFromThai`, share-link `encodeShare`/`decodeShare`, `toggle`, numeric input guards.
- [`app/drugData.ts`](app/drugData.ts) — curated, verified drug-name translations (`findDrug`, `verifiedName`: exact alias match, then prefix match for queries ≥3 chars). Aliases cover Thai, English and brand names.
- [`app/specialData.ts`](app/specialData.ts) — step-by-step usage guides (`inhaler_mdi`, `insulin_pen`) with per-language text. The `inhaler_mdi` title only has th/en/fr; `GuideCard` falls back to `en`.
- [`app/globals.css`](app/globals.css) — Tailwind import, iPhone safe-area helpers, shared animations/scrollbars, and the `@media print` rules (the `print-*` classes). Tailwind is wired via `@tailwindcss/postcss`; there is no `tailwind.config.*`. A `print-*` class used in JSX without a rule here does nothing, so add the rule or drop the class.

### Key concepts

**Two-sided screen**: the pharmacist side is Thai (`strings('th')`); the patient side uses `patientLang` (`strings(patientLang)`). The patient panel is rendered `rotate-180` so it faces the patient across the counter; `print-rotate-0` / `isSharedLink` undo the rotation for printing and shared links. `ar` sets RTL.

**Languages**: `dict` has 8 keys (`th`, `en`, `de`, `fr`, `zh`, `ja`, `ru`, `ar`); `LANGUAGES` (the picker) omits `th`. Adding a language means touching `dict`, `unitDict`, `drugData`'s `DrugLang` + every entry's `names`, `specialData`, `BCP47` in `speech.ts` and `GT_LANG` in `utils.ts` (`zh` maps to `zh-CN`).

**Dict indexing**: dose/frequency/time/period/warning/indication options are arrays in `dict`, and a `Prescription` stores **indexes** into them (`rxDose`, `rxFreq`, `rxWarnings`, …), not text. The arrays must stay the same length and order across all languages, and the icon arrays (`ind_icons`, `warn_icons`, …) are parallel to them. `Prescription` field names are also the share-link format (`?rx=`), so don't rename them. Meaning of the indexes the dispense form relies on: periods 0 เช้า, 1 บ่าย, 2 เย็น, 3 ก่อนนอน, 4 เวลามีอาการ; frequencies 0–3 = วันละ 1–4 ครั้ง, 4 ทุก 4-6 ชม., 5 ทุก 6 ชม., 6 ทุก 8 ชม. Doses are entered as `cDose` + `cDoseUnit` (the single cc/ml chip stores `ml`); the old fixed dose chips (`rxDose`) are no longer set by the form but still render for old share links. Frequency follows the number of ticked periods until the pharmacist picks one by hand.

**State**: the in-progress prescription is one `rx` object (`useState<Prescription>`) updated with `patch({...})`; `cart: Prescription[]` holds finished ones. `DispenseForm` receives `rx` + `patch`. Update nested data immutably (e.g. taper steps) — `cart` items must not share objects with the live form.

**App modes**: `appMode: 'history' | 'dispense' | 'specialty'`. `dispense` has sub-state `dispenseState: 'input' | 'present'` (form vs. fullscreen "boarding pass"); `showBoardingPass()` auto-adds the in-progress form to the cart. Dosing is either standard fields plus "smart dose" numeric overrides (`cDose`/`cHour`/`cApply`/`cDays` + unit keys from `unitDict`) or tapering (`isTapering` + `taperSteps`). A typed message sets `activeQuestion = 'custom_msg'`, which has no `dict` entry — its text is `translatedText`.

**Drug-name safety**: the form tries the curated `drugData` first (✅ "verified", derived by comparing `rx.drugName` with `verifiedName(...)`); only on a miss does it fall back to Google Translate (⚠️ "unverified"). Indications and custom warnings only have the machine-translation path.

**Speech**: `speak()` picks a browser `SpeechSynthesis` voice by language and `voiceGender`. If the OS has no voice for the language (common for ja/ru/ar/zh on a fresh Windows install), the utterance is silently dropped — translation still shows on screen. For tapering prescriptions the spoken text is just "Complex Tapering Dosing" — the schedule itself is not read aloud.

**External calls** (direct from the client):
- `translate.googleapis.com/translate_a/single?client=gtx` — unofficial endpoint, Thai → patient language, via `translateFromThai()` (6s timeout, joins all returned segments); failures are only `console.error`'d.
- `is.gd` then `v.gd` (`shortenUrl()`, 8 s timeout each) — shortens the share link; the whole cart + language is base64**url**-encoded into the `?rx=` query param (plain base64 breaks: a `+` comes back as a space), `decodeShare` still accepts the old plain-base64 links, and on load a valid `rx` param opens the boarding pass directly in `isSharedLink` mode.

**iPhone / PWA**: the only manifest is `app/manifest.ts` (served as `/manifest.webmanifest`); icons and the iOS `apple-mobile-web-app-*` tags come from `metadata` in `app/layout.tsx`, icon file is `public/apple-touch-iconv2.png`. `viewportFit: "cover"` plus the `black-translucent` status bar means the page draws under the Dynamic Island, so top/bottom spacing must use `env(safe-area-inset-*)` (`.safe-top`, `.safe-bottom`, `.pb-safe` in `globals.css`, inline paddings on the root and fullscreen containers). Safe-area insets are 0 in desktop browsers, so they can only be confirmed on a real iPhone or simulator.
