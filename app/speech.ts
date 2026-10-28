import { Lang, Prescription, fillTemplate, strings } from './dict';

const BCP47: Record<string, string> = {
  ar: 'ar-SA', de: 'de-DE', en: 'en-US', fr: 'fr-FR', zh: 'zh-CN', ja: 'ja-JP', ru: 'ru-RU',
};

// Browsers expose no gender on voices, so match well-known voice names.
const FEMALE = ['female', 'siri', 'kyoko', 'samantha', 'laila', 'ting', 'meijia', 'anna', 'helena', 'milena', 'karen', 'amelie', 'audrey', 'marie', 'yuna', 'monica', 'katya'];
const MALE = ['male', 'siri', 'otoya', 'aaron', 'maged', 'tarik', 'yushu', 'daniel', 'arthur', 'martin', 'thomas', 'nicolas', 'yuri', 'pavel'];

// Russian abbreviations the engines read badly, plus UI markers that must stay silent.
const SPOKEN_FIXES: [string, string][] = [
  ['ч.л.', 'чайная ложка'], ['ст.л.', 'столовая ложка'], ['табл.', 'таблетка'], ['капс.', 'капсула'],
  ['(s)', ''], ['(n)', ''],
];

const synth = () => (typeof window !== 'undefined' ? window.speechSynthesis : undefined);

// The voice list loads lazily in most browsers; call once at startup so it's ready for the first tap.
export const primeVoices = () => {
  const s = synth();
  if (!s) return;
  s.getVoices();
  s.onvoiceschanged = () => s.getVoices();
};

export const stopSpeech = () => synth()?.cancel();

// Returns false when speech isn't available, so callers don't show a "speaking" state that never ends.
export const speak = (text: string, lang: Lang | string, gender: 'female' | 'male', onEnd: () => void, forceEnglish = false): boolean => {
  const s = synth();
  if (!s) return false;
  s.cancel();

  const utterance = new SpeechSynthesisUtterance(SPOKEN_FIXES.reduce((t, [from, to]) => t.replaceAll(from, to), text));
  const target = forceEnglish ? 'en-US' : (BCP47[lang] || lang);
  const voices = s.getVoices();
  let candidates = voices.filter(v => v.lang.toLowerCase().startsWith(target.toLowerCase()));
  if (candidates.length === 0) candidates = voices.filter(v => v.lang.toLowerCase().startsWith(lang.toLowerCase()));

  const find = (premiumOnly: boolean) => candidates.find(v => {
    const name = v.name.toLowerCase();
    if (premiumOnly && !['siri', 'premium', 'enhanced', 'natural'].some(w => name.includes(w))) return false;
    const isFemale = FEMALE.some(f => name.includes(f));
    const isMale = MALE.some(m => name.includes(m));
    return gender === 'male' ? isMale || (!isFemale && name.includes('male')) : isFemale || (!isMale && name.includes('female'));
  });

  const voice = find(true) || find(false) || candidates[0];
  utterance.voice = voice ?? null;
  utterance.lang = voice ? voice.lang : target;
  utterance.rate = 0.85;
  utterance.onend = onEnd;
  s.speak(utterance);
  return true;
};

export const rxSpeechText = (rx: Prescription, lang: Lang): string => {
  const p = strings(lang);
  const drug = rx.drugName ? `${p.drug_name} ${rx.drugName}.\n` : '';
  let indication = '';
  if (rx.rxIndication !== null) indication = p.indication[rx.rxIndication] + '. ';
  if (rx.customIndication) indication = rx.customIndication + '. ';

  const parts: string[] = [];
  if (rx.isTapering) {
    parts.push('Complex Tapering Dosing');
  } else {
    if (rx.rxDose !== null) parts.push(p.dose[rx.rxDose]);
    if (Number(rx.cDose) > 0) parts.push(fillTemplate(p.smart_dose, rx.cDose, rx.cDoseUnit, lang));
    if (rx.rxFreq !== null) parts.push(p.freq[rx.rxFreq]);
    if (Number(rx.cHour) > 0) parts.push(fillTemplate(p.smart_hour, rx.cHour, rx.cHourUnit, lang));
    if (Number(rx.cApply) > 0) parts.push(fillTemplate(p.smart_apply, rx.cApply, rx.cApplyUnit, lang));
    if (rx.rxTime !== null) parts.push(p.time[rx.rxTime]);
    if (rx.rxPeriod.length > 0) parts.push(rx.rxPeriod.map(i => p.period[i]).join(', '));
    if (Number(rx.cDays) > 0) parts.push(fillTemplate(p.smart_days, rx.cDays, rx.cDaysUnit, lang));
    if (rx.rxSide !== null) parts.push(p.side[rx.rxSide]);
  }
  return drug + indication + (parts.length > 0 ? parts.join(', ') + '.\n' : '');
};

export const warningsSpeechText = (rx: Prescription, lang: Lang): string => {
  const p = strings(lang);
  const warnings = [...rx.rxWarnings.map(w => p.warn[w]), ...rx.customWarnings];
  const header = warnings.length > 0 ? p.warn_title + ':\n' : '';
  return header + warnings.map(w => w + '\n').join('') + p.allergy_alert + '\n';
};
