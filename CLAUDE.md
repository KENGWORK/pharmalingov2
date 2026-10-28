# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (flat config, eslint.config.mjs)
```

`npm run build` passes (it type-checks). `npm run lint` currently fails with ~15 errors in `app/page.tsx`, mostly `no-explicit-any` and `prefer-const`, plus `react-hooks/set-state-in-effect` for the `?rx=` load effect — so lint noise is pre-existing; don't treat it as caused by your change.

There are no automated tests in this project (no test runner, no single-test command). README.md is a one-line placeholder.

## Architecture

**Single-page Next.js 16 app** (App Router, React 19, Tailwind v4, TypeScript) for pharmacists dispensing to foreign-language patients. There is no backend and no API routes; everything runs client-side. Most logic lives in one file:

- [`app/page.tsx`](app/page.tsx) — ~1240 lines, `'use client'`. Holds the UI strings (`dict`, `unitDict`), types, all React state, helpers, and the render tree. A `<style dangerouslySetInnerHTML>` block near the end (~line 1196) defines the `print-*` classes and `@media print` rules — they are **not** in `globals.css`.
- [`app/drugData.ts`](app/drugData.ts) — curated, verified drug-name translations (`findDrug()`: exact alias match, then prefix match for queries ≥3 chars). Aliases cover Thai, English and brand names.
- [`app/specialData.ts`](app/specialData.ts) — step-by-step usage guides (`inhaler_mdi`, `insulin_pen`) with per-language text. the `inhaler_mdi` title only has th/en/fr (other languages fall back to `en` via `guide.title[patientLang] || guide.title.en`); its steps cover all languages.
- [`app/globals.css`](app/globals.css) — only Tailwind import + theme vars. Tailwind is wired via `@tailwindcss/postcss` in `postcss.config.mjs`; there is no `tailwind.config.*`.

### Key concepts

**Two-sided screen**: the pharmacist side is Thai (`th = dict.th`); the patient side uses `patientLang` (`p = dict[patientLang]`). The patient panel is rendered `rotate-180` so it faces the patient across the counter; `print-rotate-0` / `isSharedLink` undo the rotation for printing and shared links. `ar` sets `isRTL`.

**Languages**: `dict` has 8 keys (`th`, `en`, `de`, `fr`, `zh`, `ja`, `ru`, `ar`); `LANGUAGES` (the picker) omits `th`. Adding a language means touching `dict`, `unitDict`, `drugData`'s `DrugLang` + every entry's `names`, `specialData`, `exactLangMap` (TTS) and the Google Translate `langMap` (it appears in several functions — `zh` maps to `zh-CN`).

**Dict indexing**: dose/frequency/time/period/warning/indication options are arrays in `dict`, and a `Prescription` stores **indexes** into them (`rxDose`, `rxFreq`, `rxWarnings`, …), not text. The arrays must stay the same length and order across all languages, and the icon arrays (`ind_icons`, `warn_icons`, …) are parallel to them.

**App modes**: `appMode: 'history' | 'dispense' | 'specialty'`. `dispense` has sub-state `dispenseState: 'input' | 'present'` (form vs. fullscreen "boarding pass"). Prescriptions accumulate in `cart: Prescription[]`; `showBoardingPass()` auto-adds the in-progress form. Dosing is either standard fields plus "smart dose" numeric overrides (`cDose`/`cHour`/`cApply`/`cDays` + unit keys from `unitDict`) or tapering (`isTapering` + `taperSteps`).

**Drug-name safety**: `translateDrugName()` tries the curated `drugData` first (`drugVerified = true`, shown ✅ to the pharmacist); only on a miss does it fall back to Google Translate (`drugVerified = false`, shown ⚠️ "unverified"). Indications and custom warnings only have the machine-translation path.

**Speech**: `generateSpeechText` / `generateWarningsSpeechText` build the spoken text; `speakText` picks a browser `SpeechSynthesis` voice by language and `voiceGender`. For tapering prescriptions the spoken text is just "Complex Tapering Dosing." — the schedule itself is not read aloud.

**External calls** (direct from the client):
- `translate.googleapis.com/translate_a/single?client=gtx` — unofficial endpoint, Thai → patient language, all calls go through `translateFromThai()` (6s timeout, joins all returned segments); failures are only `console.error`'d.
- `is.gd/create.php` — shortens the share link; the whole cart + language is base64-encoded into the `?rx=` query param (`encodeData` / `decodeData`), and on load a valid `rx` param opens the boarding pass directly in `isSharedLink` mode.

**iPhone / PWA**: the only manifest is `app/manifest.ts` (served as `/manifest.webmanifest`); icons and the iOS `apple-mobile-web-app-*` tags come from `metadata` in `app/layout.tsx`, icon file is `public/apple-touch-iconv2.png`. `viewportFit: "cover"` plus `black-translucent` status bar means the page draws under the Dynamic Island, so top/bottom spacing must use `env(safe-area-inset-*)` (`.safe-top`, `.safe-bottom`, `.pb-safe` in `globals.css`, inline paddings on the root and fullscreen containers). Put any CSS the language picker needs in `globals.css`: the picker returns early, before `page.tsx`'s inline `<style>` renders. Safe-area insets are 0 in desktop browsers, so they can only be confirmed on a real iPhone or simulator.
