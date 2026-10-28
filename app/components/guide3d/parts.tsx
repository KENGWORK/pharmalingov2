'use client';
import { useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { loopPhase, segment } from '../../anim';

export type Vec3 = [number, number, number];
export type PhaseRef = MutableRefObject<number>;

// Position (0..1) inside the current step's looping animation. Restarts whenever `stepKey` changes
// (new step, or the replay button), so every step always starts from its first frame.
export function useStepPhase(stepKey: number, period: number): PhaseRef {
  const phase = useRef(0);
  const start = useRef({ key: -1, at: 0 });
  useFrame(({ clock }) => {
    if (start.current.key !== stepKey) start.current = { key: stepKey, at: clock.elapsedTime };
    phase.current = loopPhase(clock.elapsedTime - start.current.at, period);
  });
  return phase;
}

export const COLORS = {
  skin: '#f2c29b',
  lips: '#f0707f',
  steel: '#cbd5e1',
  white: '#f8fafc',
  blue: '#2563eb',
  navy: '#1e3a8a',
  teal: '#0d9488',
  amber: '#f59e0b',
  air: '#38bdf8',
  warn: '#ef4444',
};

// Row of cones sliding along +y of their group (rotate the group to aim them): air flowing in or out.
export function Arrows({ phase, length = 0.9, count = 4, color = COLORS.air, position = [0, 0, 0], rotation = [0, 0, 0] }:
  { phase: PhaseRef; length?: number; count?: number; color?: string; position?: Vec3; rotation?: Vec3 }) {
  const cones = useRef<(Mesh | null)[]>([]);
  useFrame(() => {
    cones.current.forEach((cone, i) => {
      if (!cone) return;
      const t = (phase.current * 1.5 + i / count) % 1;
      cone.position.y = t * length;
      cone.scale.setScalar(Math.sin(Math.PI * t) * 1.1 + 0.001);
    });
  });
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(m) => { cones.current[i] = m; }} position={[(i % 2 ? 0.08 : -0.08), 0, (i % 3 - 1) * 0.1]}>
          <coneGeometry args={[0.1, 0.26, 16]} />
          <meshStandardMaterial color={color} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Ring that fills up around its centre over the window [from, to] of the phase (the 10 second hold).
// Faces +z by default; rotate the group to lay it flat.
export function CountdownRing({ phase, from = 0.04, to = 0.96, radius = 0.6, segments = 40, color = COLORS.teal, position = [0, 0, 0], rotation = [0, 0, 0] }:
  { phase: PhaseRef; from?: number; to?: number; radius?: number; segments?: number; color?: string; position?: Vec3; rotation?: Vec3 }) {
  const bars = useRef<(Mesh | null)[]>([]);
  useFrame(() => {
    const filled = segment(phase.current, from, to) * segments;
    bars.current.forEach((bar, i) => { if (bar) bar.visible = i < filled; });
  });
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: segments }, (_, i) => {
        const angle = Math.PI / 2 - (i / segments) * Math.PI * 2;
        return (
          <mesh key={i} ref={(m) => { bars.current[i] = m; }} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.07, 0.19, 0.07]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
      <mesh>
        <torusGeometry args={[radius, 0.012, 8, 64]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
