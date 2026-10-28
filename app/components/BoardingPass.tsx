import { memo } from 'react';
import { Lang, Prescription, fillTemplate, strings, unitDict } from '../dict';
import { rxSpeechText, warningsSpeechText } from '../speech';

type Props = { rx: Prescription; lang: Lang; isSpeaking: boolean; onSpeak: (text: string) => void };

// Long drug names wrap instead of shrinking, so they stay readable on a phone.
const DrugName = ({ text, main }: { text: string; main: boolean }) => (
  <div className="w-full flex items-center justify-center px-2 relative z-10 print:px-0 print:py-0">
    <span className={`print-text-wrap print-no-scale break-words text-center font-black uppercase ${main ? 'text-4xl md:text-6xl text-slate-900 print:text-[1.8rem]' : 'text-xl md:text-3xl text-yellow-900 opacity-80 print:text-[1.2rem]'}`}>
      {text}
    </span>
  </div>
);

// One prescription = two snap-scroll cards: instructions (blue) and warnings (red).
function BoardingPass({ rx, lang, isSpeaking, onSpeak }: Props) {
  const p = strings(lang);
  const th = strings('th');
  const isRTL = lang === 'ar';
  const onSpeakRx = () => { const text = rxSpeechText(rx, lang); if (text) onSpeak(text); };
  const onSpeakWarnings = () => onSpeak(warningsSpeechText(rx, lang));

  const displayDrugEn = rx.drugInput.trim();
  const displayDrugLocal = rx.drugName && rx.drugName.toLowerCase() !== rx.drugInput.toLowerCase() ? rx.drugName : '';

  let instCount = 0;
  if (rx.rxDose !== null || Number(rx.cDose) > 0) instCount++;
  if (rx.rxFreq !== null || Number(rx.cHour) > 0 || Number(rx.cApply) > 0) instCount++;
  if (rx.rxTime !== null || Number(rx.cDays) > 0) instCount++;
  if (rx.rxPeriod.length > 0) instCount++;
  if (rx.rxSide !== null) instCount++;

  const isCrowded = instCount >= 4;
  const instPadding = isCrowded ? "p-3 md:p-4" : "p-4 md:p-5";
  const instGap = isCrowded ? "gap-2 md:gap-3" : "gap-3 md:gap-4";
  const instTextSize = isCrowded ? "text-lg md:text-2xl" : "text-xl md:text-3xl";
  const iconSizeClass = isCrowded ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl";

  const warnCount = rx.rxWarnings.length + rx.customWarnings.length;
  const isWarnCrowded = warnCount >= 4;
  const warnPadding = isWarnCrowded ? "p-3 md:p-4" : "p-4 md:p-5";
  const warnGap = isWarnCrowded ? "gap-2 md:gap-3" : "gap-3 md:gap-4";
  const warnTextSize = isWarnCrowded ? "text-base md:text-xl" : "text-lg md:text-2xl";
  const warnIconClass = isWarnCrowded ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl";

  return (
    <div className="w-full h-full flex-shrink-0 snap-center overflow-x-hidden overflow-y-auto snap-y snap-mandatory hide-scrollbar transform-gpu" style={{ WebkitOverflowScrolling: 'touch' }} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Flexbox Layout for Print */}
      <div className="w-full h-full flex flex-col snap-y snap-mandatory print-rx-layout">

        {/* Blue Card */}
        <div className="w-full h-full min-h-full flex items-center justify-center p-4 snap-center print-block print-card-wrapper">
          <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl h-full max-h-[85dvh] flex flex-col bg-white rounded-[2rem] shadow-2xl border-2 border-blue-100 overflow-hidden print-rx-card">

            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 md:p-6 text-center relative shrink-0 flex justify-between items-center shadow-inner print-bg-blue print-header">
              <span className="text-4xl md:text-5xl opacity-20 print-text-white">🏥</span>
              <div className="flex flex-col items-center w-full">
                <h1 className="text-white font-black text-base md:text-xl tracking-widest uppercase print-text-white leading-tight">Bangkok Pattaya Hospital</h1>
                <p className="text-blue-200 text-xs md:text-sm font-bold mt-0.5 tracking-widest print-text-white">{p.rx_title}</p>
              </div>
              <button onClick={onSpeakRx} className={"w-12 h-12 md:w-14 md:h-14 rounded-full text-xl md:text-2xl shadow-md flex items-center justify-center print-hidden " + (isSpeaking ? "bg-white text-blue-600 animate-pulse" : "bg-blue-800 text-white border border-blue-400 hover:bg-blue-700")}>
                {isSpeaking ? '🛑' : '🔊'}
              </button>
            </div>

            <div className={"bg-blue-50/40 flex flex-col " + instGap + " p-4 md:p-6 min-h-0 overflow-y-auto custom-scrollbar flex-1 print-bg-transparent"}>
              {(displayDrugEn || displayDrugLocal) && (
                <div className={"bg-gradient-to-r from-amber-100 to-yellow-200 border-2 border-yellow-400 rounded-2xl " + (isCrowded ? "py-2 px-2" : "py-4 px-3") + " flex flex-col items-center justify-center shadow-sm text-center shrink-0 print-box"}>
                  <span className={"text-yellow-800 font-black uppercase mb-1 tracking-widest " + (isCrowded ? "text-xs md:text-sm" : "text-sm md:text-base")}>💊 {p.drug_name}</span>
                  <div className="flex flex-col items-center justify-center w-full px-1 gap-1">
                    {displayDrugLocal && <DrugName text={displayDrugLocal} main={true} />}
                    {displayDrugEn && <DrugName text={displayDrugLocal ? "(" + displayDrugEn + ")" : displayDrugEn} main={!displayDrugLocal} />}
                  </div>
                </div>
              )}

              {(rx.rxIndication !== null || rx.customIndication) && (
                <div className={"bg-blue-100 border-l-8 border-blue-500 rounded-r-xl " + (isCrowded ? "p-3" : "p-4 md:p-5") + " flex items-center gap-3 shadow-sm shrink-0 print-box"}>
                  <span className={iconSizeClass + " shrink-0"}>🎯</span>
                  <div className="flex flex-col">
                    <span className={"text-blue-600 uppercase font-black " + (isCrowded ? "text-xs md:text-sm" : "text-sm md:text-base")}>{p.ind_title}</span>
                    <span className={"text-blue-900 font-black mt-1 leading-tight " + (isCrowded ? "text-xl md:text-2xl" : "text-2xl md:text-3xl")}>{rx.rxIndication !== null ? p.indication[rx.rxIndication] : rx.customIndication}</span>
                  </div>
                </div>
              )}

              {rx.isTapering ? (
                <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex-1 print-box" style={{flexDirection:'column', alignItems:'stretch'}}>
                  <div className="text-indigo-600 font-black text-xs md:text-base uppercase mb-2 text-center border-b pb-2">📉 {p.taper_mode}</div>
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className="text-slate-400 text-[10px] md:text-sm uppercase border-b-2">
                          <th className="pb-2 text-left">💊 {p.dosage}</th>
                          <th className="pb-2">🍽️ {p.time_col}</th>
                          <th className="pb-2 text-right">🗓️ {p.duration}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rx.taperSteps.map((step, idx) => (
                          <tr key={idx} className="border-b border-slate-50 last:border-0">
                            <td className="py-2 font-black text-sm md:text-lg text-blue-600 text-left">{step.dose} {unitDict[step.unit][lang]}</td>
                            <td className="py-2 text-xs md:text-sm">
                               <div className="text-teal-600 font-bold">{step.time !== null && p.time[step.time]}</div>
                               <div className="text-orange-600 font-bold">{step.periods.map(i => th.period_icons[i] + " " + p.period[i]).join(', ')}</div>
                            </td>
                            <td className="py-2 font-black text-sm md:text-lg text-slate-700 text-right">{step.days} {unitDict.day[lang]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className={"flex flex-col " + instGap + ""}>
                  {(rx.rxDose !== null || Number(rx.cDose) > 0) && (
                    <div className={"flex items-center gap-4 bg-white rounded-xl shadow-sm border border-slate-100 " + instPadding + " print-box print-bg-white"}>
                      <span className={iconSizeClass}>💊</span>
                      <div className={"flex flex-wrap items-center gap-2 font-black text-slate-800 " + instTextSize + " leading-tight"}>
                        <span>{rx.rxDose !== null ? p.dose[rx.rxDose] : fillTemplate(p.smart_dose, rx.cDose, rx.cDoseUnit, lang)}</span>
                      </div>
                    </div>
                  )}

                  {(rx.rxFreq !== null || Number(rx.cHour) > 0 || Number(rx.cApply) > 0) && (
                    <div className={"flex items-center gap-4 bg-white rounded-xl shadow-sm border border-slate-100 " + instPadding + " print-box print-bg-white"}>
                      <span className={iconSizeClass}>🔄</span>
                      <span className={"font-black text-slate-800 " + instTextSize + " leading-tight"}>
                        {rx.rxFreq !== null && <div>{p.freq[rx.rxFreq]}</div>}
                        {Number(rx.cHour) > 0 && <div className="text-indigo-600">{fillTemplate(p.smart_hour, rx.cHour, rx.cHourUnit, lang)}</div>}
                        {Number(rx.cApply) > 0 && <div className="text-indigo-600">{fillTemplate(p.smart_apply, rx.cApply, rx.cApplyUnit, lang)}</div>}
                      </span>
                    </div>
                  )}

                  {(rx.rxTime !== null || Number(rx.cDays) > 0) && (
                    <div className={"flex items-center gap-4 bg-white rounded-xl shadow-sm border border-slate-100 " + instPadding + " print-box print-bg-white"}>
                      <span className={iconSizeClass}>🍽️</span>
                      <span className={"font-black text-slate-800 " + instTextSize + " leading-tight"}>
                        {rx.rxTime !== null && <div>{p.time[rx.rxTime]}</div>}
                        {Number(rx.cDays) > 0 && <div className="text-emerald-600 mt-1">{fillTemplate(p.smart_days, rx.cDays, rx.cDaysUnit, lang)}</div>}
                      </span>
                    </div>
                  )}

                  {rx.rxPeriod.length > 0 && (
                    <div className="flex flex-wrap gap-2 print-box print-bg-transparent">
                      {rx.rxPeriod.map((i) => (
                        <span key={i} className={"bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-black border border-orange-200 shadow-sm " + (isCrowded ? "text-base md:text-lg" : "text-lg md:text-xl")}>
                          {p.period_icons[i]} {p.period[i]}
                        </span>
                      ))}
                    </div>
                  )}

                  {rx.rxSide !== null && (
                    <div className={"flex items-center gap-4 bg-white rounded-xl shadow-sm border border-slate-100 print-box print-bg-white " + instPadding}>
                      <span className={iconSizeClass}>🧭</span>
                      <span className={"font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 " + (isCrowded ? "text-base md:text-lg" : "text-lg md:text-xl")}>
                        {p.side_icons[rx.rxSide]} {p.side[rx.rxSide]}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Red Card */}
        <div className="w-full h-full min-h-full flex items-center justify-center p-4 snap-center print-block print-card-wrapper">
          <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl h-full max-h-[85dvh] flex flex-col bg-white rounded-[2rem] shadow-2xl border-2 border-red-200 overflow-hidden print-rx-card">

            <div className="bg-gradient-to-r from-red-800 to-rose-900 p-4 md:p-6 text-center relative shrink-0 flex justify-between items-center shadow-inner print-bg-red print-header">
              <span className="text-4xl md:text-5xl opacity-20 print-text-white">⚠️</span>
              <div className="flex flex-col items-center w-full">
                <h1 className="text-white font-black text-base md:text-xl tracking-widest uppercase print-text-white leading-tight">Bangkok Pattaya Hospital</h1>
                <p className="text-red-200 text-xs md:text-sm font-bold mt-0.5 tracking-widest print-text-white">{p.warn_title}</p>
              </div>
              <button onClick={onSpeakWarnings} className={"w-12 h-12 md:w-14 md:h-14 rounded-full text-xl md:text-2xl shadow-md flex items-center justify-center print-hidden " + (isSpeaking ? "bg-white text-red-600 animate-pulse" : "bg-red-800 text-white border border-red-400 hover:bg-red-700")}>
                {isSpeaking ? '🛑' : '🔊'}
              </button>
            </div>

            <div className={"bg-red-50/60 flex flex-col " + warnGap + " p-4 md:p-6 min-h-0 overflow-y-auto custom-scrollbar flex-1 print-bg-transparent"}>
              <h3 className="text-red-600 font-black text-xs md:text-base uppercase tracking-widest border-b-2 border-red-200 pb-2 mb-2 text-center">⚠️ {p.warn_title}</h3>

              <div className={"flex flex-col " + warnGap + ""}>
                {(rx.rxWarnings.length > 0 || rx.customWarnings.length > 0) ? (
                  <>
                    {rx.rxWarnings.map((wIdx) => (
                      <div key={wIdx} className={"flex items-center bg-white rounded-xl shadow-sm border border-red-100 print-box print-bg-white " + warnPadding}>
                        <span className={warnIconClass + " shrink-0 mr-3"}>{th.warn_icons[wIdx]}</span>
                        <span className={"text-red-700 font-black leading-snug " + warnTextSize}>{p.warn[wIdx]}</span>
                      </div>
                    ))}
                    {rx.customWarnings.map((cw, i) => (
                      <div key={i} className={"flex items-center bg-red-100 rounded-xl shadow-sm border border-red-300 print-box " + warnPadding}>
                        <span className={warnIconClass + " shrink-0 mr-3"}>🚨</span>
                        <span className={"text-red-800 font-black leading-snug " + warnTextSize}>{cw}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-300 opacity-60"><span className="text-5xl md:text-6xl mb-3">✅</span><span className="font-black text-sm md:text-base">No special warnings</span></div>
                )}
              </div>

              {/* Allergy Alert */}
              <div className={"bg-red-600 text-white rounded-xl flex items-center gap-3 shadow-md border border-red-400 mt-3 print-box print-bg-red " + (isWarnCrowded ? "p-3" : "p-4")}>
                 <span className={"shrink-0 print-text-white " + (isWarnCrowded ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl")}>🛑</span>
                 <span className={"font-black leading-snug print-text-white " + (isWarnCrowded ? "text-sm md:text-base" : "text-base md:text-lg")}>{p.allergy_alert}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default memo(BoardingPass);
