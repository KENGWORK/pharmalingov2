// Pure timing helpers for the 3D teaching guides (no imports, so `npm test` can run them with Node).

export type SceneKind = 'mdi' | 'pen';

// Which 3D scene a guide uses; null means "no 3D scene, show the plain step list"
export const sceneFor = (guideId: string): SceneKind | null =>
  guideId === 'inhaler_mdi' ? 'mdi' : guideId === 'insulin_pen' ? 'pen' : null;

export const clampStep = (step: number, count: number): number => Math.max(0, Math.min(step, count - 1));

// Seconds of elapsed time -> position (0..1) inside a loop of `period` seconds
export const loopPhase = (elapsed: number, period: number): number => (((elapsed % period) + period) % period) / period;

// Where `phase` sits inside the window [from, to], clamped to 0..1
export const segment = (phase: number, from: number, to: number): number => Math.max(0, Math.min(1, (phase - from) / (to - from)));

// Smoothstep: starts and ends gently
export const ease = (x: number): number => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

// 0 outside the window, rising to 1 in the middle and back to 0 (one "press and release")
export const pulse = (phase: number, from: number, to: number): number =>
  phase <= from || phase >= to ? 0 : Math.sin(Math.PI * segment(phase, from, to));

// Language-independent number shown over the 3D view on the steps where it matters
export const overlayFor = (scene: SceneKind, step: number): string | null => {
  if (scene === 'mdi') return step === 3 ? '10 s' : null;
  return step === 3 ? '90°' : step === 4 ? '10 s' : null;
};
