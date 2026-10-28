'use client';
import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3, type Group } from 'three';
import type { SceneKind } from '../../anim';
import MdiScene from './MdiScene';
import PenScene from './PenScene';
import type { Vec3 } from './parts';

type Shot = { pos: Vec3; look: Vec3 };

// Camera position / target per scene and step; the camera glides between them
const SHOTS: Record<SceneKind, Shot[]> = {
  mdi: [
    { pos: [1.6, 0.5, 7.2], look: [1.55, 0.25, 0] },
    { pos: [1.6, 0.5, 6.9], look: [1.55, 0.25, 0] },
    { pos: [1.6, 0.4, 6.8], look: [1.5, 0.2, 0] },
    { pos: [2.2, 0.4, 6.8], look: [2.3, 0.2, 0.4] },
    { pos: [1.8, 0.3, 6.8], look: [1.6, 0.0, 0.3] },
  ],
  pen: [
    { pos: [0, 0.4, 6.8], look: [0, 0.2, 0] },
    { pos: [1.4, 1.4, 6.4], look: [0, 0.3, 0] },
    { pos: [0.8, 0.2, 5.4], look: [0, -1.5, 0] },
    { pos: [0.2, 0.15, 7.6], look: [0, 0.15, 0] },
    { pos: [2.2, 0.4, 6.2], look: [0, -0.3, 0] },
  ],
};

// Lets the learner drag to turn the model, slides the camera between shots and resets the turn on each step
function Rig({ scene, step, children }: { scene: SceneKind; step: number; children: React.ReactNode }) {
  const group = useRef<Group>(null);
  const turn = useRef({ yaw: 0, pitch: 0, dragging: false, x: 0, y: 0 });
  const look = useRef(new Vector3(...SHOTS[scene][0].look));
  const goal = useRef(new Vector3());
  const { camera, gl } = useThree();

  useEffect(() => {
    const t = turn.current;
    const el = gl.domElement;
    const down = (e: PointerEvent) => { t.dragging = true; t.x = e.clientX; t.y = e.clientY; el.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (!t.dragging) return;
      t.yaw += (e.clientX - t.x) * 0.012;
      t.pitch = Math.max(-0.6, Math.min(0.6, t.pitch + (e.clientY - t.y) * 0.008));
      t.x = e.clientX;
      t.y = e.clientY;
    };
    const up = () => { t.dragging = false; };
    const reset = () => { t.yaw = 0; t.pitch = 0; };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('dblclick', reset);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('dblclick', reset);
    };
  }, [gl]);

  // A new step starts from the front again
  useEffect(() => { turn.current.yaw = 0; turn.current.pitch = 0; }, [step]);

  useFrame((_, dt) => {
    const shot = SHOTS[scene][step];
    const k = 1 - Math.exp(-4 * dt);
    camera.position.lerp(goal.current.set(...shot.pos), k);
    look.current.lerp(goal.current.set(...shot.look), k);
    camera.lookAt(look.current);
    if (group.current) {
      const follow = 1 - Math.exp(-10 * dt);
      group.current.rotation.y += (turn.current.yaw - group.current.rotation.y) * follow;
      group.current.rotation.x += (turn.current.pitch - group.current.rotation.x) * follow;
    }
  });

  // Rotate around the middle of what the camera is looking at, not the world origin
  const pivot = SHOTS[scene][step].look;
  return (
    <group position={[pivot[0], 0, 0]}>
      <group ref={group}>
        <group position={[-pivot[0], 0, 0]}>{children}</group>
      </group>
    </group>
  );
}

export default function GuideStage({ scene, step, stepKey }: { scene: SceneKind; step: number; stepKey: number }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ fov: 32, position: SHOTS[scene][0].pos }} gl={{ antialias: true, alpha: true }} style={{ touchAction: 'none' }}>
      <ambientLight intensity={1.15} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} />
      <Rig scene={scene} step={step}>
        {scene === 'mdi' ? <MdiScene step={step} stepKey={stepKey} /> : <PenScene step={step} stepKey={stepKey} />}
      </Rig>
    </Canvas>
  );
}
