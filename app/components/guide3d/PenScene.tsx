'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import { ease, segment } from '../../anim';
import { COLORS, CountdownRing, useStepPhase } from './parts';

const SKIN_TOP = -1.45; // y of the skin surface
const TICKS = 12;

// Insulin pen: 0 roll to mix, 1 dial the dose, 2 clean the skin, 3 inject at 90 degrees, 4 hold 10 s.
// The pen is built upright (needle down, dial and button on top) and moved/rotated per step.
export default function PenScene({ step, stepKey }: { step: number; stepKey: number }) {
  const phase = useStepPhase(stepKey, 6);
  const pen = useRef<Group>(null);
  const spinner = useRef<Group>(null); // the pen's long axis, for rolling
  const dial = useRef<Group>(null);
  const button = useRef<Mesh>(null);
  const swab = useRef<Group>(null);
  const skin = useRef<Group>(null);
  const rightAngle = useRef<Group>(null);

  useFrame(() => {
    const p = phase.current;

    if (pen.current && spinner.current) {
      let y = 0;
      let lying = 0; // 1 = lying on its side
      let x = 0;
      if (step === 0) { lying = 1; y = 0.2; x = Math.sin(p * Math.PI * 4) * 0.35; }
      if (step === 1) y = 0.3;
      if (step === 3) y = 0.55 - 0.9 * ease(segment(p, 0.12, 0.55)) + 0.9 * ease(segment(p, 0.85, 1));
      if (step === 4) y = -0.35;
      pen.current.visible = step !== 2;
      pen.current.position.set(x, y, 0);
      pen.current.rotation.z = lying * (Math.PI / 2);
      spinner.current.rotation.y = step === 0 ? Math.sin(p * Math.PI * 4) * Math.PI * 1.1 : 0;
    }

    // Dose dial turns and the button pops up as the dose is wound on; it is pressed down while holding
    const wound = step === 1 ? ease(segment(p, 0.15, 0.75)) : 0;
    if (dial.current) dial.current.rotation.y = wound * Math.PI * 1.5;
    if (button.current) button.current.position.y = 1.34 + 0.14 * wound - (step === 4 ? 0.16 : 0) - (step === 3 ? 0.16 * ease(segment(p, 0.55, 0.7)) : 0);

    // Alcohol swab wiping the skin
    if (swab.current) {
      swab.current.visible = step === 2;
      swab.current.position.set(Math.sin(p * Math.PI * 6) * 0.55, SKIN_TOP + 0.08, Math.cos(p * Math.PI * 3) * 0.2);
    }
    if (skin.current) skin.current.visible = step >= 2;
    if (rightAngle.current) rightAngle.current.visible = step === 3 && p > 0.55 && p < 0.85;
  });

  return (
    <group>
      <group ref={pen}>
        <group ref={spinner}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 1.4, 32]} />
            <meshStandardMaterial color={COLORS.white} roughness={0.35} />
          </mesh>
          {/* cartridge window with the insulin */}
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.205, 0.205, 0.78, 32]} />
            <meshStandardMaterial color={COLORS.amber} transparent opacity={0.55} roughness={0.2} />
          </mesh>
          {/* stripe so the rolling is visible */}
          <mesh position={[0.2, 0.05, 0]}>
            <boxGeometry args={[0.025, 1.3, 0.07]} />
            <meshStandardMaterial color={COLORS.blue} />
          </mesh>
          {/* needle hub and needle */}
          <mesh position={[0, -0.9, 0]}>
            <cylinderGeometry args={[0.11, 0.15, 0.2, 24]} />
            <meshStandardMaterial color={COLORS.steel} metalness={0.4} />
          </mesh>
          <mesh position={[0, -1.23, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.028, 0.5, 12]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* dose dial: ridged ring with tick marks that turn with it */}
          <group ref={dial} position={[0, 0.95, 0]}>
            <mesh>
              <cylinderGeometry args={[0.24, 0.24, 0.5, 32]} />
              <meshStandardMaterial color={COLORS.blue} roughness={0.4} />
            </mesh>
            {Array.from({ length: TICKS }, (_, i) => {
              const a = (i / TICKS) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(a) * 0.245, 0, Math.sin(a) * 0.245]} rotation={[0, -a, 0]}>
                  <boxGeometry args={[0.03, 0.42, 0.045]} />
                  <meshStandardMaterial color={i === 0 ? COLORS.warn : COLORS.white} />
                </mesh>
              );
            })}
          </group>
          <mesh ref={button} position={[0, 1.34, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.3, 24]} />
            <meshStandardMaterial color={COLORS.navy} roughness={0.4} />
          </mesh>
        </group>
      </group>

      <group ref={skin}>
        <mesh position={[0, SKIN_TOP - 0.25, 0]}>
          <boxGeometry args={[2.2, 0.5, 1.5]} />
          <meshStandardMaterial color={COLORS.skin} roughness={0.8} />
        </mesh>
      </group>

      <group ref={swab} visible={false}>
        <mesh>
          <boxGeometry args={[0.8, 0.16, 0.55]} />
          <meshStandardMaterial color={COLORS.white} />
        </mesh>
        <mesh position={[0, 0.085, 0]}>
          <boxGeometry args={[0.66, 0.02, 0.42]} />
          <meshStandardMaterial color="#7dd3fc" />
        </mesh>
      </group>

      {/* 90 degree marker: skin line, pen axis and a quarter-circle between them */}
      <group ref={rightAngle} position={[0, SKIN_TOP + 0.02, 0.4]} visible={false}>
        <mesh position={[0.35, 0, 0]}>
          <boxGeometry args={[0.7, 0.025, 0.025]} />
          <meshStandardMaterial color={COLORS.warn} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.025, 0.7, 0.025]} />
          <meshStandardMaterial color={COLORS.warn} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.3, 0.014, 8, 32, Math.PI / 2]} />
          <meshStandardMaterial color={COLORS.warn} />
        </mesh>
      </group>

      {step === 4 && <CountdownRing phase={phase} radius={0.8} position={[0, SKIN_TOP + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} />}
    </group>
  );
}
