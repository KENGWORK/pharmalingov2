'use client'
import { useCallback, useEffect, useState } from 'react';
import { Lang, LANGUAGES, Prescription, Strings, emptyRx, strings } from './dict';
import { specialData } from './specialData';
import { primeVoices, speak, stopSpeech } from './speech';
import { decodeShare, encodeShare, shortenUrl, translateFromThai } from './utils';
import BoardingPass from './components/BoardingPass';
import DispenseForm from './components/DispenseForm';
import GuideCard from './components/GuideCard';

type AppMode = 'history' | 'dispense' | 'specialty';
type DispenseState = 'input' | 'present';
type Answer = 'yes' | 'no' | 'dont_know';

// Pharmacist history-taking questions (text comes from dict by id).
const QUESTIONS = [
  { id: 'q_name', icon: '👤' },
  { id: 'q_dob', icon: '📅' },
  { id: 'q_allergy', icon: '🚫' },
  { id: 'q_inj', icon: '💉' },
  { id: 'q_med', icon: '💊' },
];
const YES_NO_QUESTIONS = ['q_allergy', 'q_inj', 'q_med'];

const questionIcon = (id: string | null) => QUESTIONS.find(q => q.id === id)?.icon ?? '💊';

export default function PharmaLingoApp() {
  const [hasStarted, setHasStarted] = useState(false);
  const [animatingLang, setAnimatingLang] = useState<string | null>(null);
  const [patientLang, setPatientLang] = useState<Lang>('en');
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');

  const [appMode, setAppMode] = useState<AppMode>('history');
  const [dispenseState, setDispenseState] = useState<DispenseState>('input');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [boolAnswer, setBoolAnswer] = useState<Answer | null>(null);
  const [activeGuide, setActiveGuide] = useState<(typeof specialData)[number] | null>(null);

  const [rx, setRx] = useState<Prescription>(emptyRx);
  const patch = useCallback((change: Partial<Prescription>) => setRx(prev => ({ ...prev, ...change })), []);
  const [cart, setCart] = useState<Prescription[]>([]);

  const [customText, setCustomText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [shortLink, setShortLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isSharedLink, setIsSharedLink] = useState(false);

  const p = strings(patientLang);
  const th = strings('th');
  const isRTL = patientLang === 'ar';

  // Open straight into the boarding pass when the page was loaded from a shared ?rx= link.
  useEffect(() => {
    primeVoices();
    const shared = new URLSearchParams(window.location.search).get('rx');
    const decoded = shared && decodeShare(shared);
    if (decoded && decoded.cart) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL after mount; reading it during render would break hydration
      setCart(decoded.cart);
      if (decoded.lang) setPatientLang(decoded.lang);
      setHasStarted(true);
      setDispenseState('present');
      setIsFullscreen(true);
      setIsSharedLink(true);
    }
  }, []);

  const say = useCallback((text: string, lang: Lang = patientLang, forceEnglish = false) => {
    if (speak(text, lang, voiceGender, () => setIsSpeaking(false), forceEnglish)) setIsSpeaking(true);
  }, [patientLang, voiceGender]);

  const silence = () => { stopSpeech(); setIsSpeaking(false); };

  const generatePrintLink = async () => {
    setIsGeneratingLink(true);
    setShortLink('');
    setShowLinkModal(true);
    const longUrl = window.location.origin + '/?rx=' + encodeShare({ cart, lang: patientLang });
    setShortLink((await shortenUrl(longUrl)) ?? 'Error: Link generation failed');
    setIsGeneratingLink(false);
  };

  const sendCustomMessage = async () => {
    if (!customText.trim()) return;
    setIsTranslating(true);
    try {
      const translated = await translateFromThai(customText, patientLang);
      setTranslatedText(translated);
      setActiveQuestion('custom_msg');
      setAppMode('history');
      say(translated);
      setCustomText('');
    } catch (error) { console.error(error); }
    setIsTranslating(false);
  };

  const speakGuide = useCallback((text: string) => say(text), [say]);

  // A typed message has no dict entry: its text is whatever was just translated.
  const activeText = (strs: Strings) => (activeQuestion === 'custom_msg' || !activeQuestion ? translatedText : strs[activeQuestion]);

  // Speaker buttons always (re)start the speech, even while it's still playing.
  const speakHistory = () => say(activeText(p));

  const handleLangSelect = (code: Lang, label: string) => {
    setPatientLang(code);
    setAnimatingLang(code);
    say(label, 'en', true);
    setTimeout(() => { setHasStarted(true); setAnimatingLang(null); }, 550);
  };

  const askQuestion = (id: string) => {
    setAppMode('history');
    setActiveQuestion(id);
    setTranslatedText('');
    setBoolAnswer(null);
    say(p[id]);
  };

  const hasDraft = rx.drugInput !== '' || rx.rxIndication !== null || rx.rxDose !== null || rx.isTapering;

  // Starting a fresh prescription also remounts the form (key) so its local UI state (open panels, typed text) resets too.
  const [formKey, setFormKey] = useState(0);
  const resetRx = () => { setRx(emptyRx()); setFormKey(k => k + 1); };

  const addToCart = () => { setCart([...cart, rx]); resetRx(); };

  const clearAll = () => {
    resetRx();
    setCart([]);
    setDispenseState('input');
    setIsFullscreen(false);
    setActiveGuide(null);
    silence();
  };

  const showBoardingPass = () => {
    if (hasDraft) addToCart();
    setDispenseState('present');
    setIsFullscreen(true);
    silence();
  };

  const closePresentation = () => {
    setIsFullscreen(false);
    setDispenseState('input');
    setActiveGuide(null);
    silence();
  };

  if (!hasStarted) {
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center overflow-hidden font-sans">
        <div className={"absolute safe-top text-center z-20 transition-opacity duration-300 " + (animatingLang ? "opacity-0" : "opacity-100")}>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-widest drop-shadow-md">ASSISTANCE DISPENSER</h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base font-bold tracking-widest uppercase">Tap to Select Patient Language</p>
        </div>

        <div className="relative w-[300px] h-[300px] flex items-center justify-center mt-12 md:mt-20">
          <div className={"absolute w-full h-full rounded-full border-[4px] border-slate-800 transition-opacity duration-300 " + (animatingLang ? "opacity-0" : "opacity-100")}></div>
          {LANGUAGES.map((l, index) => {
            const rotation = index * (360 / LANGUAGES.length);
            const isAnimating = animatingLang === l.code;
            const isOther = animatingLang && animatingLang !== l.code;
            return (
              <button key={l.code} onClick={() => handleLangSelect(l.code, l.label)}
                className={"absolute top-1/2 left-1/2 w-20 h-20 -ml-10 -mt-10 flex flex-col items-center justify-center outline-none transition-all duration-[500ms] ease-[cubic-bezier(0.8,0,0.2,1)] " + (isOther ? "opacity-0 scale-0 " : " ") + (isAnimating ? "z-50" : "z-10 hover:scale-110 cursor-pointer")}
                style={isAnimating ? { transform: 'translate(0px, 0px) scale(80)' } : { transform: "rotate(" + rotation + "deg) translateY(-150px)" }}
              >
                <div className={"flex flex-col items-center justify-center w-full h-full rounded-full transition-all duration-300 " + (isAnimating ? "bg-slate-50" : "")} style={{ transform: "rotate(" + (-rotation) + "deg)" }}>
                  <div className={"transition-all duration-[500ms] " + (isAnimating ? "text-[1px] opacity-0" : "text-5xl")}>{l.flag}</div>
                  <span className={"mt-2 font-black text-[10px] md:text-xs bg-slate-900/80 px-3 py-1 rounded-md border text-slate-300 border-slate-700 whitespace-nowrap " + (isAnimating ? "opacity-0" : "opacity-100")}>{l.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className={"absolute safe-bottom z-20 flex gap-4 transition-opacity duration-300 " + (animatingLang ? "opacity-0" : "opacity-100")}>
          <button onClick={() => setVoiceGender('female')} className={"px-6 py-3 rounded-full font-black text-sm md:text-base transition-colors duration-100 border-2 " + (voiceGender === 'female' ? "bg-pink-600 text-white border-pink-400 shadow-[0_0_15px_rgba(219,39,119,0.5)]" : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700")}>👩🏻 Female Voice</button>
          <button onClick={() => setVoiceGender('male')} className={"px-6 py-3 rounded-full font-black text-sm md:text-base transition-colors duration-100 border-2 " + (voiceGender === 'male' ? "bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700")}>👨🏻 Male Voice</button>
        </div>
      </div>
    );
  }

  // Percentages of the root box (which already excludes the top safe area), so the pharmacist
  // panel always gets what's left. 70% (not 75%) while a question is up keeps its close button visible.
  let patientHeightClass = 'h-1/4 p-6 print-hidden';
  if (appMode === 'history' && activeQuestion) patientHeightClass = 'h-[70%] p-6 print-hidden';
  if (appMode === 'dispense' && dispenseState === 'input') patientHeightClass = 'h-[8%] p-2 print-hidden';

  const isYesNo = YES_NO_QUESTIONS.includes(activeQuestion as string);
  const showAnswerCard = (answer: Answer) => {
    if (answer === 'dont_know') return <div className="bg-yellow-500 text-white rounded-[2rem] p-6 font-black text-3xl md:text-4xl text-center">⚠️ OK</div>;
    // "yes" to allergy / oral meds needs the details written down; everything else is just acknowledged
    if (answer === 'yes' && activeQuestion !== 'q_inj') {
      return <div className="bg-red-500 text-white rounded-[2rem] p-6 flex flex-col items-center"><div className="text-5xl md:text-6xl mb-4 bg-white/20 w-20 h-20 rounded-full flex items-center justify-center">📝</div><p className="text-lg md:text-2xl font-black text-center">{p.writePaper}</p></div>;
    }
    return <div className={(answer === 'yes' ? 'bg-blue-500' : 'bg-green-500') + ' text-white rounded-[2rem] p-6 font-black text-3xl md:text-4xl text-center'}>✅ OK!</div>;
  };

  const passes = cart.length > 0 ? cart : [rx];

  return (
    // fixed inset-0, not h-[100dvh]: on iOS home-screen apps 100dvh comes out ~64pt shorter than the real screen
    <div id="main-print-container" style={{ paddingTop: 'env(safe-area-inset-top)' }} className="fixed inset-0 bg-[#0f172a] font-sans flex flex-col overflow-hidden print-relative print-h-auto print-overflow-visible">

      {/* Patient View Area. Fullscreen: the view is rotated 180° unless it's a shared link, so pad both
          ends with the (larger) top inset to keep the Dynamic Island clear whichever way up it is. */}
      <div style={isFullscreen ? { paddingTop: 'env(safe-area-inset-top)', paddingBottom: isSharedLink ? 'env(safe-area-inset-bottom)' : 'env(safe-area-inset-top)' } : undefined} className={`w-full flex justify-center items-center transition-[height] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] print-rotate-0 print-block print-bg-white ${isSharedLink ? 'rotate-0 ' : 'rotate-180 '} ${isFullscreen ? 'fixed inset-0 z-[100] bg-slate-900 h-full print-relative print-bg-white print-z-0' : 'bg-slate-100 ' + patientHeightClass}`}>

        {dispenseState === 'present' && !activeGuide ? (
          <div className="w-full h-full flex flex-col bg-slate-900 relative print-bg-white print-h-auto print-block print-w-full print-mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="absolute top-6 left-6 bg-blue-600 text-white font-black px-4 py-2 md:px-5 md:py-3 rounded-full shadow-xl border-2 border-blue-400 flex items-center gap-2 z-50 print-hidden pointer-events-auto">
              <span className="text-xl md:text-2xl">📸</span> <span className="text-[10px] md:text-sm">{p.photo_prompt}</span>
            </div>
            <div className="absolute top-6 right-6 flex items-center gap-2 z-50 pointer-events-none print-hidden">
              <button onClick={() => window.print()} className="bg-emerald-500 hover:bg-emerald-400 text-white w-10 h-10 md:w-12 md:h-12 rounded-full text-xl font-black shadow-xl flex items-center justify-center border-2 border-emerald-300 pointer-events-auto active:scale-95">🖨️</button>
              <button onClick={closePresentation} className="bg-red-500 hover:bg-red-400 text-white w-10 h-10 md:w-12 md:h-12 rounded-full text-xl md:text-2xl font-black shadow-xl flex items-center justify-center border-2 border-red-300 pointer-events-auto active:scale-95">✕</button>
            </div>
            {cart.length > 1 && (
              <div className="absolute bottom-6 right-6 bg-slate-800/80 text-white font-black text-xl md:text-2xl w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full border-2 border-slate-600 shadow-xl z-50 pointer-events-none print-hidden">
                {cart.length}
              </div>
            )}
            <div className="flex-1 w-full h-full relative print-h-auto print-overflow-visible">
              {cart.length > 1 && <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest z-50 pointer-events-none bg-slate-900/80 px-6 py-2 rounded-full border border-slate-700 print-hidden">{p.swipe_hint}</div>}
              <div id="horizontal-scroll-container" className="w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex hide-scrollbar scroll-smooth transform-gpu print-flex-col print-overflow-visible print-h-auto print-snap-none" style={{ WebkitOverflowScrolling: 'touch' }}>
                {passes.map((r, idx) => (
                  <BoardingPass key={idx} rx={r} lang={patientLang} isSpeaking={isSpeaking} onSpeak={say} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div dir={isRTL ? 'rtl' : 'ltr'} className={`relative transition-opacity duration-500 flex flex-col w-full h-full bg-white rounded-[2rem] shadow-xl overflow-hidden print-hidden ${activeQuestion || activeGuide ? 'opacity-100 p-4 md:p-6 pt-12 md:pt-10' : 'opacity-0'}`}>
            {activeGuide ? (
              <div className="w-full h-full flex flex-col relative">
                <div className="w-full shrink-0 flex items-center justify-end z-50 absolute top-0 right-0 pointer-events-none">
                  <button onClick={closePresentation} className="bg-red-500 hover:bg-red-400 text-white w-10 h-10 md:w-12 md:h-12 rounded-full text-xl font-black shadow-md flex items-center justify-center border border-red-300 pointer-events-auto">✕</button>
                </div>
                <div className="flex-1 w-full h-full flex items-center justify-center p-2 md:p-4">
                  <GuideCard guide={activeGuide} lang={patientLang} isSpeaking={isSpeaking} onSpeak={speakGuide} />
                </div>
              </div>
            ) : appMode === 'history' ? (
              <div className="text-center w-full flex flex-col h-full justify-center overflow-hidden pt-6 sm:pt-0">
                {activeQuestion === 'custom_msg' ? (
                  <div className="animate-in"><div className="text-6xl md:text-7xl mb-4 bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">💬</div><h2 className="text-2xl md:text-4xl font-black text-blue-600 mb-4 leading-snug">{translatedText}</h2></div>
                ) : (
                  <div>
                    {(!boolAnswer && activeQuestion !== 'q_name' && activeQuestion) && (
                      <div className="mb-4 text-blue-600 text-sm md:text-base font-bold bg-blue-50 px-6 py-2 rounded-full animate-pulse self-center border border-blue-100 inline-block">{p.tap_to_select}</div>
                    )}
                    {(!boolAnswer || !isYesNo) && (
                      <div className="animate-in relative">
                        <div className="text-5xl md:text-6xl mb-4 bg-slate-100 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
                          {questionIcon(activeQuestion)}
                        </div>
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <h2 className="text-2xl md:text-4xl font-black text-slate-800">{activeQuestion ? p[activeQuestion] : ''}</h2>
                          {activeQuestion && (
                            <button onClick={speakHistory} className={`w-12 h-12 rounded-full text-xl shadow-md flex items-center justify-center border ${isSpeaking ? "bg-blue-600 text-white border-blue-400 animate-pulse" : "bg-slate-100 text-slate-500 border-slate-300"}`}>
                              🔊
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {activeQuestion === 'q_dob' && (
                      <div className="w-full max-w-xl mx-auto mt-4 animate-in fade-in">
                        <div className="bg-blue-50 text-blue-800 rounded-[2rem] p-6 flex flex-col items-center shadow-md border-2 border-blue-200">
                          <div className="text-5xl md:text-6xl mb-4">✍️</div>
                          <p className="text-lg md:text-2xl font-black text-center">{p.write_dob}</p>
                        </div>
                      </div>
                    )}
                    {isYesNo && (
                      <div className="w-full max-w-xl mx-auto mt-2">
                        {!boolAnswer ? (
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button onClick={() => setBoolAnswer('yes')} className="flex-1 py-4 md:py-6 rounded-[1.5rem] text-xl md:text-2xl font-black bg-red-50 text-red-600 border-2 border-red-200 shadow-sm active:scale-95">🚨 {p.yes}</button>
                            <button onClick={() => setBoolAnswer('no')} className="flex-1 py-4 md:py-6 rounded-[1.5rem] text-xl md:text-2xl font-black bg-green-50 text-green-600 border-2 border-green-200 shadow-sm active:scale-95">✅ {p.no}</button>
                            {activeQuestion === 'q_allergy' && (
                              <button onClick={() => setBoolAnswer('dont_know')} className="flex-1 py-4 md:py-6 rounded-[1.5rem] text-xl md:text-2xl font-black bg-yellow-50 text-yellow-700 border-2 border-yellow-300 shadow-sm active:scale-95">🤷‍♂️ {p.dont_know}</button>
                            )}
                          </div>
                        ) : showAnswerCard(boolAnswer)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Pharmacist View Area */}
      {!isFullscreen && (
        <div className="flex-1 bg-[#0f172a] rounded-t-[2.5rem] border-t border-slate-600/60 relative z-10 flex flex-col min-h-0 print-hidden">
          <div className="flex justify-between items-center p-4 md:p-6 pb-2 shrink-0">
            <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
              {([
                ['history', th.tab_history, 'bg-cyan-600'],
                ['dispense', th.tab_dispense, 'bg-indigo-600'],
                ['specialty', th.tab_special, 'bg-teal-600'],
              ] as const).map(([mode, label, on]) => (
                <button key={mode} onClick={() => { setAppMode(mode); if (mode !== 'history') setActiveQuestion(null); setDispenseState('input'); }} className={`px-3 py-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm font-black ${appMode === mode ? on + ' text-white' : 'text-slate-400'}`}>{label}</button>
              ))}
            </div>
            <div className="flex gap-2">
              {appMode === 'dispense' && (
                <button onClick={clearAll} className="text-[10px] md:text-xs font-black text-white bg-red-900/40 px-3 py-2 md:px-4 md:py-3 rounded-xl border border-red-800 hover:bg-red-800">🗑️ เคลียร์</button>
              )}
              {appMode === 'dispense' && cart.length > 0 && (
                <button onClick={generatePrintLink} disabled={isGeneratingLink} className="text-[10px] md:text-xs font-black text-white bg-indigo-600 px-3 py-2 md:px-4 md:py-3 rounded-xl border border-indigo-400 hover:bg-indigo-500 flex items-center gap-1.5 disabled:opacity-50">
                  {isGeneratingLink ? '⏳ รอ...' : '🔗 ลิ้งก์ปริ้นท์'}
                </button>
              )}
              <button onClick={() => { setHasStarted(false); setActiveQuestion(null); resetRx(); }} className="text-[10px] md:text-xs font-black text-white bg-slate-800 px-3 py-2 md:px-4 md:py-3 rounded-xl border border-slate-700 hover:bg-slate-700 flex items-center gap-1.5">
                <span className="text-base md:text-lg">{LANGUAGES.find(l => l.code === patientLang)?.flag}</span><span className="hidden md:inline">{th.change_lang}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-0 custom-scrollbar relative">
            {appMode === 'history' && (
              <div>
                {activeQuestion ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 animate-in">
                    <div className="text-cyan-400 font-bold text-lg md:text-xl flex items-center gap-3">
                      <span className="text-3xl">🗣️</span> ถาม: {activeText(th)}
                      <button onClick={speakHistory} className={`p-3 rounded-full text-xl shadow-md flex items-center justify-center border active:scale-95 ${isSpeaking ? "bg-indigo-600 text-white border-indigo-400 animate-pulse" : "bg-slate-800 text-slate-300 border-slate-600"}`}>
                        🔊
                      </button>
                    </div>
                    <button onClick={() => { setActiveQuestion(null); setBoolAnswer(null); }} className="bg-red-600 text-white font-black py-3 px-8 rounded-full text-base md:text-lg shadow-sm border border-red-400 mt-2 active:scale-95">
                      ❌ ปิดหน้าจอ
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 animate-in">
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {QUESTIONS.slice(0, 3).map(q => (
                        <button key={q.id} onClick={() => askQuestion(q.id)} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border min-h-[100px] shadow-sm active:scale-95 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                          <div className="text-3xl md:text-4xl">{q.icon}</div><span className="font-black text-xs md:text-sm text-center leading-tight">{th[q.id]}</span>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      {QUESTIONS.slice(3).map(q => (
                        <button key={q.id} onClick={() => askQuestion(q.id)} className="flex items-center justify-center gap-3 p-4 rounded-xl border shadow-sm active:scale-95 bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700">
                          <div className="text-2xl md:text-3xl">{q.icon}</div><span className="font-black text-xs md:text-sm">{th[q.id]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {appMode === 'dispense' && dispenseState === 'input' && <DispenseForm key={formKey} rx={rx} patch={patch} lang={patientLang} />}

            {appMode === 'specialty' && (
              <div className="flex flex-col gap-6 pb-24 animate-in">
                <div className="bg-gradient-to-br from-teal-900/40 to-emerald-900/40 p-4 md:p-6 rounded-2xl border border-teal-800/50 shadow-inner">
                  <h2 className="text-teal-300 font-black text-sm md:text-base mb-4 flex items-center gap-2">🪄 เลือกอุปกรณ์เทคนิคพิเศษ</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {specialData.map(item => (
                      <button key={item.id} onClick={() => { setActiveGuide(item); setIsFullscreen(true); }} className="bg-slate-800 border border-slate-700 hover:border-teal-400 hover:bg-slate-700 rounded-xl p-4 flex items-center gap-4 shadow-sm active:scale-95">
                        <span className="text-3xl md:text-4xl">{item.icon}</span><span className="text-slate-200 font-black text-xs md:text-sm text-left">{item.title.th}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {appMode === 'dispense' && dispenseState === 'input' && (
            <div className="absolute bottom-0 left-0 w-full p-3 md:p-4 pb-safe bg-slate-900 border-t border-slate-700 flex flex-col md:flex-row items-center gap-3 z-50">
              <button onClick={addToCart} disabled={!rx.drugInput && rx.rxIndication === null} className="w-full md:w-auto bg-slate-800 border border-slate-600 text-white font-black px-6 py-3 md:py-4 rounded-xl disabled:opacity-30 text-xs md:text-sm active:scale-95">
                {th.add_to_cart}
              </button>
              <button onClick={showBoardingPass} disabled={cart.length === 0 && !rx.drugInput} className="flex-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm md:text-base py-3 md:py-4 rounded-xl shadow-md disabled:opacity-30 border border-indigo-400/50 active:scale-95">
                🚀 โชว์การ์ดทั้งหมด {cart.length > 0 ? `(${cart.length} ${th.items})` : ''}
              </button>
            </div>
          )}

          {appMode === 'history' && !activeQuestion && (
            // Floating card pinned to the screen's bottom edge (not the panel, whose height varies on iOS):
            // 3.6rem = 57.6px, about 1 cm on an iPhone, and always clear of the home indicator
            <div className="fixed left-3 right-3 md:left-6 md:right-6 z-50 rounded-2xl bg-slate-800 border border-slate-600 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.45)]" style={{ bottom: 'max(3.6rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
              <div className="flex gap-2 items-center">
                <input type="text" value={customText} onChange={(e) => setCustomText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendCustomMessage()} placeholder="พิมพ์สื่อสารทั่วไป..." className="flex-1 min-w-0 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none font-bold text-[16px] md:text-sm" />
                <button onClick={sendCustomMessage} disabled={!customText.trim() || isTranslating} className="bg-cyan-600 text-white font-black px-5 py-3 rounded-xl disabled:opacity-50 text-xs md:text-sm border border-cyan-400/50 active:scale-95">
                  ส่ง 💬
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] print-hidden">
          <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col items-center max-w-sm w-[90%] shadow-[0_0_50px_rgba(79,70,229,0.5)] animate-in rotate-0">
            <div className="text-5xl mb-4">💻</div>
            <h3 className="text-slate-800 font-black text-lg md:text-xl text-center mb-2">พิมพ์ลิ้งก์ที่คอมเพื่อปริ้นท์</h3>
            <div className="bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-black text-3xl md:text-4xl py-4 px-8 rounded-2xl my-4 w-full text-center tracking-widest">{shortLink || '⏳'}</div>
            <button onClick={() => setShowLinkModal(false)} className="bg-slate-800 text-white font-black px-8 py-3 rounded-full active:scale-95 w-full">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}
    </div>
  );
}
