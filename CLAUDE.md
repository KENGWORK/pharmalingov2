# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

There are no automated tests in this project.

## Architecture

This is a **single-page Next.js 16 app** (App Router) targeting multilingual pharmacy dispensing workflows. The entire application logic lives in two files:

- [`app/page.tsx`](app/page.tsx) — The entire app: ~1220 lines, all client-side (`'use client'`). Contains all React state, UI rendering, and helper functions inline.
- [`app/specialData.ts`](app/specialData.ts) — Canonical specialty medication usage guides (MDI inhaler, insulin pen) with per-language step descriptions. Imported by `page.tsx`.

### Key concepts

**Language system**: The `dict` object in `page.tsx` maps 7 language codes (`th`, `en`, `de`, `zh`, `ja`, `ru`, `ar`) to full UI string translations. The `patientLang` state (type `Lang`) drives all displayed text via `p = dict[patientLang]`. Arabic (`ar`) triggers RTL layout via `isRTL`.

**App modes**: Three tabs controlled by `appMode: 'history' | 'dispense' | 'specialty'`.
- `history` — Pharmacist asks pre-set questions (name, DOB, allergies, injections) in the patient's language, with TTS playback.
- `dispense` — Pharmacist builds prescriptions. Has two sub-states: `input` (form) and `present` (fullscreen boarding pass). Prescriptions queue in a `cart: Prescription[]`.
- `specialty` — Displays step-by-step usage guides from `specialData`.

**Prescription / Boarding Pass**: The `Prescription` type captures drug name, indication, dose, frequency, timing, warnings, tapering schedule, and smart-dose numeric overrides. `renderBoardingPass()` generates a printable "boarding pass" card. Supports both standard and tapering (`isTapering`) dosing modes.

**External APIs** (called directly from the client, no API routes):
- `translate.googleapis.com` — Drug name, indication, and custom warning translation from Thai to target language.
- `is.gd` — URL shortener for generating shareable prescription links. Prescription data is base64-encoded into the `?rx=` query param.

**TTS**: Uses the browser's `SpeechSynthesis` API. Voice selection prefers premium/Siri voices and respects the `voiceGender` toggle. Language codes map to BCP-47 tags via `exactLangMap`.

**PWA**: Configured as an installable PWA via `/public/manifest.json` and Apple meta tags in `app/layout.tsx`.

**Tailwind v4**: Uses `@tailwindcss/postcss` plugin. No `tailwind.config.*` file — configuration is in `postcss.config.mjs`. Extensive use of print-specific utility classes (prefixed `print-`) defined in `app/globals.css`.
