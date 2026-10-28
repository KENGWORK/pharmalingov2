'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import { ease, pulse, segment } from '../../anim';
import { Arrows, COLORS, CountdownRing, useStepPhase } from './parts';

const SPRAY = 14;
const DROPS = 6;
const AWAY_X = -0.5; // inhaler held away from the mouth
const MOUTH_X = 0.85; // mouthpiece tip inside the lips
const LIPS_X = 1.95;
const LIPS_Y = -0.52;

// MDI inhaler: 0 breathe out, 1 seal lips, 2 press + inhale, 3 hold 10 s, 4 rinse.
export default function MdiScene({ step, stepKey }: { step: number; stepKey: number }) {
  const phase = useStepPhase(stepKey, 6);
  const inhaler = useRef<Group>(null);
  const canister = useRef<Group>(null);
  const lips = useRef<Mesh>(null);
  const spray = useRef<(Mesh | null)[]>([]);
  const cup = useRef<Group>(null);
  const drops = useRef<(Mesh | null)[]>([]);

  useFrame(() => {
    const p = phase.current;

    if (inhaler.current) {
      const x = step === 1 ? AWAY_X + (MOUTH_X - AWAY_X) * ease(segment(p, 0.1, 0.55)) : step === 2 ? MOUTH_X : AWAY_X;
      inhaler.current.position.x = x;
      inhaler.current.position.y = step === 0 ? Math.sin(p * Math.PI * 2) * 0.03 : 0;
      inhaler.current.visible = step < 3; // taken out of the mouth for the hold and the rinse
    }
    if (canister.current) canister.current.position.y = step === 2 ? -0.24 * pulse(p, 0.2, 0.62) : 0;
    if (lips.current) lips.current.scale.setScalar(step === 1 ? 1.18 - 0.18 * ease(segment(p, 0.35, 0.6)) : 1);

    // Puffs of medicine leaving the mouthpiece while the canister is down
    const burst = step === 2 ? segment(p, 0.3, 0.72) : 0;
    spray.current.forEach((puff, i) => {
      if (!puff) return;
      const live = burst > 0 && burst < 1;
      puff.visible = live;
      if (!live) return;
      const t = (burst * 1.6 + i / SPRAY) % 1;
      puff.position.set(LIPS_X - 0.05 + t * 0.85, LIPS_Y + Math.sin(i * 2.3) * 0.14 * t, Math.cos(i * 1.9) * 0.14 * t);
      puff.scale.setScalar(Math.max(0.001, 1 - t * 0.8));
    });

    // Rinse: the cup tips towards the mouth and water falls
    if (cup.current) {
      const tilt = ease(segment(p, 0.1, 0.5));
      cup.current.visible = step === 4;
      cup.current.rotation.z = -1.0 * tilt;
      drops.current.forEach((drop, i) => {
        if (!drop) return;
        const live = step === 4 && tilt > 0.55;
        drop.visible = live;
        if (!live) return;
        const t = (p * 2.2 + i / DROPS) % 1;
        drop.position.set(0.55 + Math.sin(i) * 0.05, 0.2 - t * 0.9, 0.05 * Math.cos(i));
      });
    }
  });

  return (
    <group>
      {/* head, drawn see-through so the spray inside the mouth is visible */}
      <mesh position={[LIPS_X + 1.0, -0.4, 0]}>
        <sphereGeometry args={[1.0, 32, 24]} />
        <meshStandardMaterial color={COLORS.skin} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <mesh ref={lips} position={[LIPS_X, LIPS_Y, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.3, 0.1, 16, 40]} />
        <meshStandardMaterial color={COLORS.lips} roughness={0.6} />
      </mesh>

      <group ref={inhaler}>
        <mesh>
          <capsuleGeometry args={[0.34, 0.8, 8, 24]} />
          <meshStandardMaterial color={COLORS.navy} roughness={0.45} />
        </mesh>
        <mesh position={[0.62, -0.52, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.8]}>
          <cylinderGeometry args={[0.23, 0.23, 0.95, 28]} />
          <meshStandardMaterial color={COLORS.navy} roughness={0.45} />
        </mesh>
        <mesh position={[1.095, -0.52, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.23, 0.035, 10, 32]} />
          <meshStandardMaterial color={COLORS.white} />
        </mesh>
        <group ref={canister}>
          <mesh position={[0, 0.95, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 1.2, 28]} />
            <meshStandardMaterial color={COLORS.white} metalness={0.3} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <cylinderGeometry args={[0.257, 0.257, 0.36, 28]} />
            <meshStandardMaterial color={COLORS.blue} roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.58, 0]}>
            <cylinderGeometry args={[0.2, 0.25, 0.1, 28]} />
            <meshStandardMaterial color={COLORS.steel} metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {Array.from({ length: SPRAY }, (_, i) => (
        <mesh key={i} ref={(m) => { spray.current[i] = m; }} visible={false}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {step === 0 && <Arrows phase={phase} length={1.0} position={[LIPS_X - 0.1, LIPS_Y, 0.15]} rotation={[0, 0, Math.PI / 2]} />}
      {step === 2 && <Arrows phase={phase} length={1.6} color={COLORS.teal} position={[0.1, -1.0, 0.1]} rotation={[0, 0, -Math.PI / 2]} />}
      {step === 3 && <CountdownRing phase={phase} radius={0.75} position={[LIPS_X + 1.0, -0.4, 1.05]} />}

      <group ref={cup} position={[LIPS_X - 0.35, -0.55, 0.9]} scale={1.6} visible={false}>
        <group position={[0, 0.3, 0]}>
          <mesh>
            <cylinderGeometry args={[0.32, 0.24, 0.6, 28, 1, true]} />
            <meshStandardMaterial color="#e2e8f0" transparent opacity={0.8} side={2} />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.03, 28]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.29, 0.24, 0.38, 28]} />
            <meshStandardMaterial color={COLORS.air} transparent opacity={0.75} />
          </mesh>
          {Array.from({ length: DROPS }, (_, i) => (
            <mesh key={i} ref={(m) => { drops.current[i] = m; }} visible={false}>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshStandardMaterial color={COLORS.air} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
