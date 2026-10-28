import { useEffect, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { clampStep, overlayFor, sceneFor } from '../anim';
import { Lang, strings } from '../dict';
import { specialData } from '../specialData';

// three.js is only downloaded when a 3D guide is actually opened
const GuideStage = dynamic(() => import('./guide3d/GuideStage'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center text-6xl animate-pulse">🪄</div>,
});

// 3D needs WebGL, and people who asked their device for reduced motion get the still step list instead
let supports3D: boolean | undefined;
const detect3D = () => {
  if (supports3D === undefined) {
    try {
      const probe = document.createElement('canvas');
      supports3D = !!(probe.getContext('webgl2') || probe.getContext('webgl')) && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      supports3D = false;
    }
  }
  return supports3D;
};
const noSubscription = () => () => {};

const AUTO_ADVANCE_MS = 6500;

type Props = { guide: (typeof specialData)[number]; lang: Lang; isSpeaking: boolean; onSpeak: (text: string) => void };

export default function GuideCard({ guide, lang, isSpeaking, onSpeak }: Props) {
  const p = strings(lang);
  const scene = sceneFor(guide.id);
  const use3D = useSyncExternalStore(noSubscription, detect3D, () => false) && scene !== null;
  const [step, setStep] = useState(0);
  const [replay, setReplay] = useState(0); // bumping it restarts the current step's animation
  const [auto, setAuto] = useState(false);
  const count = guide.steps.length;
  const current = guide.steps[clampStep(step, count)];

  // Some guides only have a few title languages; fall back to English.
  const pick = (text: object) => (text as Record<string, string>)[lang] || (text as Record<string, string>).en;
  const readAloud = () => onSpeak(use3D
    ? pick(current.desc) + '.\n'
    : pick(guide.title) + '.\n' + guide.steps.map((s, i) => `Step ${i + 1}: ${pick(s.desc)}.\n`).join(''));

  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(() => setStep((s) => (s + 1) % count), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [auto, count]);

  const overlay = use3D && scene ? overlayFor(scene, step) : null;
  const navButton = 'w-12 h-12 rounded-full text-xl font-black shadow-md border-2 flex items-center justify-center active:scale-95';

  return (
    <div className="w-full h-fit max-h-[85dvh] lg:max-w-4xl bg-white lg:rounded-[2rem] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border-4 border-teal-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-teal-700 to-emerald-900 p-4 md:p-6 text-center relative shrink-0 flex justify-between items-center shadow-inner">
        <span className="text-4xl opacity-30 print-text-white">🪄</span>
        <div className="flex flex-col items-center">
          <h1 className="text-white font-black text-lg md:text-xl tracking-widest uppercase print-text-white">Bangkok Pattaya Hospital</h1>
          <p className="text-teal-200 text-sm md:text-base font-bold mt-1 tracking-widest print-text-white">{use3D ? pick(guide.title) : p.spec_guide}</p>
        </div>
        <button onClick={readAloud} className={"w-12 h-12 md:w-14 md:h-14 rounded-full text-2xl shadow-lg flex items-center justify-center print-hidden " + (isSpeaking ? "bg-white text-teal-600 animate-pulse" : "bg-teal-800 text-white border-2 border-teal-400 hover:bg-teal-700")}>
          🔊
        </button>
      </div>

      {use3D && scene ? (
        <div className="bg-teal-50/30 flex flex-col gap-3 flex-1 overflow-y-auto p-3 md:p-5 custom-scrollbar">
          <div className={'relative w-full max-h-[44dvh] mx-auto ' + (scene === 'pen' ? 'aspect-square' : 'aspect-[4/3]') + ' rounded-3xl overflow-hidden border-2 border-teal-300 bg-gradient-to-b from-sky-100 to-emerald-50 shadow-inner'}>
            <GuideStage scene={scene} step={step} stepKey={step * 100 + replay} />
            <span className="absolute top-3 left-3 bg-white/85 text-teal-800 font-black text-sm rounded-full px-3 py-1 shadow">{step + 1} / {count}</span>
            {overlay && <span className="absolute top-3 right-3 bg-red-500 text-white font-black text-xl md:text-2xl rounded-full px-4 py-1 shadow-lg">{overlay}</span>}
            <span className="absolute bottom-2 right-3 text-sm text-slate-500/80 pointer-events-none">👆 ↔</span>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-teal-100/50">
            <div className="text-5xl shrink-0 drop-shadow-sm">{current.icon}</div>
            <span className="font-black text-xl md:text-2xl text-slate-800 leading-snug">{pick(current.desc)}</span>
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-3 print-hidden" dir="ltr">
            <button onClick={() => setStep(clampStep(step - 1, count))} disabled={step === 0} className={navButton + ' bg-white text-teal-700 border-teal-300 disabled:opacity-30'}>◀</button>
            <div className="flex items-center gap-1.5 px-1">
              {guide.steps.map((_, i) => (
                <button key={i} onClick={() => setStep(i)} aria-label={`step ${i + 1}`} className={'h-3 rounded-full transition-all ' + (i === step ? 'w-7 bg-teal-600' : 'w-3 bg-teal-200')} />
              ))}
            </div>
            <button onClick={() => setStep(clampStep(step + 1, count))} disabled={step === count - 1} className={navButton + ' bg-teal-600 text-white border-teal-400 disabled:opacity-30'}>▶</button>
            <button onClick={() => setReplay(replay + 1)} aria-label="replay" className={navButton + ' bg-white text-teal-700 border-teal-300'}>🔁</button>
            <button onClick={() => setAuto(!auto)} aria-label="autoplay" aria-pressed={auto} className={navButton + (auto ? ' bg-emerald-500 text-white border-emerald-300' : ' bg-white text-teal-700 border-teal-300')}>{auto ? '⏸' : '⏯'}</button>
          </div>
        </div>
      ) : (
        <div className="bg-teal-50/30 flex flex-col lg:flex-row gap-4 flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar print-overflow-visible">
          <div className="lg:flex-1 bg-gradient-to-r from-teal-100 to-emerald-100 border-2 border-teal-400 rounded-3xl p-5 flex items-center justify-center gap-4 shadow-sm">
            <span className="text-6xl md:text-7xl drop-shadow-md">{guide.icon}</span>
            <span className="text-teal-900 font-black text-2xl md:text-3xl leading-tight">{pick(guide.title)}</span>
          </div>
          <div className="flex flex-col lg:flex-1 lg:grid lg:grid-cols-2 gap-3 mt-2 lg:mt-0">
            {guide.steps.map((s, sIdx) => (
              <div key={sIdx} className="flex items-center gap-4 bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-teal-100/50">
                <div className="text-4xl md:text-5xl shrink-0 drop-shadow-sm">{s.icon}</div>
                <div className="flex flex-col leading-tight">
                  <span className="text-teal-500 text-xs font-black uppercase tracking-widest mb-1">Step {sIdx + 1}</span>
                  <span className="font-black text-base md:text-lg text-slate-800">{pick(s.desc)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
