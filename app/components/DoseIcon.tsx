import type { DoseIconKind } from '../sig';

const svgClass = 'inline-block h-[1em] w-[1em] align-[-0.12em]';

// Pill is an emoji. The syringe is NOT the 💉 emoji (it has a needle; this is oral medicine) and there is
// no measuring-cup emoji, so both are inline SVGs sized like one (1em).
export default function DoseIcon({ kind }: { kind: DoseIconKind }) {
  if (kind === 'pill') return <>💊</>;

  if (kind === 'syringe') {
    // Oral syringe: graduated barrel, plunger, plain blunt tip, no needle
    return (
      <svg viewBox="0 0 32 32" className={svgClass} role="img" aria-label="oral syringe">
        <rect x="22" y="14.8" width="6.5" height="2.4" fill="#94a3b8" />
        <rect x="27.4" y="10.5" width="2.6" height="11" rx="1.2" fill="#64748b" />
        <rect x="7" y="11.5" width="17" height="9" rx="2" fill="#f8fafc" stroke="#475569" strokeWidth="1.8" />
        <rect x="8.2" y="12.7" width="9.8" height="6.6" rx="1" fill="#38bdf8" />
        <rect x="17.6" y="12.2" width="3.4" height="7.6" rx="1" fill="#475569" />
        <rect x="23.4" y="9" width="1.8" height="14" rx="0.9" fill="#475569" />
        <path d="M7 14.2H3.9a1.3 1.3 0 0 0-1.3 1.3v1a1.3 1.3 0 0 0 1.3 1.3H7" fill="#f8fafc" stroke="#475569" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M10.5 11.5v1.6M13.5 11.5v2.2M16.5 11.5v1.6" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" className={svgClass} role="img" aria-label="measuring cup">
      <path d="M22 9h3.5a3 3 0 0 1 3 3v4.5a3 3 0 0 1-3 3H21.4" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M5 4h18l-2 22.2a3 3 0 0 1-3 2.8h-8a3 3 0 0 1-3-2.8z" fill="#f8fafc" stroke="#475569" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M6.6 17h14.8l-1 9.4a2 2 0 0 1-2 1.8h-8.8a2 2 0 0 1-2-1.8z" fill="#38bdf8" />
      <path d="M9 10h4M9 14h6M9 18h4M9 22h6" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
