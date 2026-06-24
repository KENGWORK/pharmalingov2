'use client'
import { useState, useRef, useEffect } from 'react';

// ==========================================
// Specialty Medication Database
// ==========================================
const specialData = [
  {
    id: "inhaler_mdi",
    icon: "💨",
    title: { th: "ยาสูดพ่นแบบกด (MDI)", en: "MDI Inhaler" },
    steps: [
      { icon: "🫁", desc: { th: "หายใจออกให้สุด", en: "Breathe out completely.", zh: "完全呼气。", ja: "息を完全に吐き出します。", ru: "Сделайте глубокий выдох.", ar: "ازفر تمامًا.", de: "Atmen Sie vollständig aus." } },
      { icon: "👄", desc: { th: "อมปากกระบอกให้สนิท", en: "Place mouthpiece in mouth.", zh: "将咬嘴放入口中。", ja: "マウスピースを口に含みます。", ru: "Поместите мундштук в рот.", ar: "ضع قطعة الفم في فมك.", de: "Nehmen Sie das Mundstück in den Mund." } },
      { icon: "🌬️", desc: { th: "กดพร้อมหายใจเข้าลึกๆ", en: "Press and inhale deeply.", zh: "按下并深吸气。", ja: "押して深く息を吸い込みます。", ru: "Нажмите и глубоко вдохните.", ar: "اضغط واستنشق بعمق.", de: "Drücken und tief einatmen." } },
      { icon: "⏱️", desc: { th: "กลั้นหายใจ 10 วินาที", en: "Hold breath for 10s.", zh: "屏住呼吸10秒。", ja: "10秒間息を止めます。", ru: "Задержите дыхание на 10 сек.", ar: "اكتم أنفاسك لمدة 10 ثوانٍ.", de: "Atem für 10s anhalten." } },
      { icon: "🫧", desc: { th: "บ้วนปากหลังใช้เสร็จ", en: "Rinse mouth after use.", zh: "使用后漱口。", ja: "使用後うがいをします。", ru: "Прополощите ротหลัง.", ar: "اشطف فมك بعد الاستخدام.", de: "Mund nach Gebrauch ausspülen." } }
    ]
  },
  {
    id: "insulin_pen",
    icon: "💉",
    title: { th: "ปากกาฉีดอินซูลิน", en: "Insulin Pen" },
    steps: [
      { icon: "🔄", desc: { th: "กลิ้งยาให้เข้ากัน", en: "Roll the pen to mix." } },
      { icon: "🔢", desc: { th: "หมุนตั้งขนาดยา", en: "Dial your dose." } },
      { icon: "🧼", desc: { th: "เช็ดทำความสะอาดผิวหนัง", en: "Clean the injection site." } },
      { icon: "🎯", desc: { th: "ฉีดตั้งฉาก 90 องศา", en: "Inject straight in (90 degrees)." } },
      { icon: "⏳", desc: { th: "กดค้างไว้ 10 วินาที", en: "Hold for 10 seconds before removing." } }
    ]
  }
];

// ==========================================
// FittedText Component - Handles Long Drug Names
// ==========================================
const FittedText = ({ text, isMain }: { text: string, isMain: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const resize = () => {
      if (containerRef.current && textRef.current) {
        const containerW = containerRef.current.offsetWidth;
        const textW = textRef.current.offsetWidth;
        if (textW > containerW) setScale(containerW / textW);
        else setScale(1);
      }
    };
    resize(); 
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [text]);

  return (
    <div ref={containerRef} className="w-full flex items-center justify-center overflow-visible px-2 relative z-10 print:px-0 print:py-0">
      <span ref={textRef} 
        // 🎯 ขยายชื่อยาให้ใหญ่ขึ้นตอน Print (1.8rem และ 1.2rem) 
        className={`print-text-wrap print-no-scale inline-block font-black origin-center whitespace-nowrap ${isMain ? 'text-4xl md:text-6xl text-slate-900 print:text-[1.8rem]' : 'text-xl md:text-3xl text-yellow-900 opacity-80 print:text-[1.2rem]'}`} 
        style={{ transform: scale < 1 ? `scale(${scale})` : 'none' }}>
        {text.toUpperCase()}
      </span>
    </div>
  );
};

// ==========================================
// Units Dictionary
// ==========================================
const unitDict: any = {
  tab: { th: 'เม็ด', en: 'tablet', de: 'Tablette', zh: '粒', ja: '錠', ru: 'табл.', ar: 'حبة' },
  cap: { th: 'แคปซูล', en: 'capsule', de: 'Kapsel', zh: '胶囊', ja: 'カプセル', ru: 'капс.', ar: 'كبسولة' },
  tsp: { th: 'ช้อนชา', en: 'teaspoon', de: 'Teelöffel', zh: '茶匙', ja: '小さじ', ru: 'ч.л.', ar: 'ملعقة صغيرة' },
  tbsp: { th: 'ช้อนโต๊ะ', en: 'tablespoon', de: 'Esslöffel', zh: '汤匙', ja: '大さじ', ru: 'ст.л.', ar: 'ملعقة كبيرة' },
  ml: { th: 'มล. (ml)', en: 'ml', de: 'ml', zh: '毫升', ja: 'ml', ru: 'мл', ar: 'مل' },
  cc: { th: 'ซีซี (cc)', en: 'cc', de: 'cc', zh: 'cc', ja: 'cc', ru: 'куб.см', ar: 'سم مكعب' },
  drop: { th: 'หยด', en: 'drop', de: 'Tropfen', zh: '滴', ja: '滴', ru: 'кап.', ar: 'قطرة' },
  puff: { th: 'กด/ปั๊ม', en: 'puff', de: 'Sprühstoß', zh: '喷', ja: 'プッシュ', ru: 'пшик', ar: 'بخة' },
  hr: { th: 'ชั่วโมง', en: 'hour', de: 'Stunde', zh: '小时', ja: '時間', ru: 'час', ar: 'ساعات' },
  day: { th: 'วัน', en: 'day', de: 'Tag', zh: '天', ja: '日', ru: 'дней', ar: 'أيام' },
  wk: { th: 'สัปดาห์', en: 'week', de: 'Woche', zh: '周', ja: '週間', ru: 'недель', ar: 'أسابيع' },
  times: { th: 'ครั้ง', en: 'time', de: 'Mal', zh: '次', ja: '回', ru: 'раз', ar: 'مرات' }
};

// ==========================================
// Translation Dictionary
// ==========================================
const dict = {
  th: { dashboard: 'แดชบอร์ดเภสัชกร', change_lang: 'เปลี่ยนภาษา', tab_history: '📋 ซักประวัติ', tab_dispense: '💊 จ่ายยา', tab_special: '🪄 เทคนิคพิเศษ', q_name: 'คุณชื่ออะไร ?', q_dob: 'คุณเกิดวันที่เท่าไหร่ ?', q_allergy: 'คุณมีประวัติแพ้ยาหรือไม่ ?', q_inj: 'วันนี้คุณได้รับการฉีดยาหรือไม่ ?', q_med: 'วันนี้คุณได้รับยารับประทานหรือไม่ ?', ans_yes: 'ใช่', ans_no: 'ไม่ใช่', ans_dont_know: 'ไม่ทราบ', drug_name: 'ยา (Medicine):', ind_title: 'ข้อบ่งใช้:', indication: ['ลดไข้ / แก้ปวด', 'แก้แพ้ / ลดน้ำมูก', 'แก้ไอ / ละลายเสมหะ', 'ยาฆ่าเชื้อ', 'แก้ท้องเสีย', 'ลดกรด / ปวดท้อง', 'แก้คลื่นไส้ / อาเจียน', 'ลดอักเสบ / ปวด'], ind_icons: ['🤒', '🤧', '🗣️', '🦠', '🚽', '🤢', '🤮', '⚡'], dose: ['ครึ่งเม็ด', '1 เม็ด', '2 เม็ด', '1 ช้อนชา', '1 ช้อนโต๊ะ', '1 กด', '1 หยด'], side: ['ตาซ้าย', 'ตาขวา', 'ตาทั้งสองข้าง', 'หูซ้าย', 'หูขวา', 'หูทั้งสองข้าง'], side_icons: ['👁️⬅️', '👁️➡️', '👁️👁️', '👂⬅️', '👂➡️', '👂👂'], freq: ['วันละ 1 ครั้ง', 'วันละ 2 ครั้ง', 'วันละ 3 ครั้ง', 'วันละ 4 ครั้ง', 'ทุก 4-6 ชม.', 'ทุก 6 ชม.', 'ทุก 8 ชม.'], time: ['ก่อนอาหาร', 'หลังอาหาร', 'หลังอาหารทันที', 'ก่อนหรือหลังอาหารก็ได้'], period: ['เช้า', 'กลางวัน', 'เย็น', 'ก่อนนอน', 'เวลามีอาการ'], period_icons: ['☀️', '🕛', '🌆', '🌙', '🩹'], warn: ['ต้องกินจนหมด', 'อาจทำให้ง่วงนอน', 'ห้ามดื่มแอลกอฮอล์', 'ห้ามกินพร้อมนม', 'ระวังแสงแดดจัด', 'ดื่มน้ำตามมากๆ', 'เปลี่ยนสีปัสสาวะ', 'เคี้ยวให้ละเอียด', 'เก็บในตู้เย็น', 'ละลายน้ำก่อนดื่ม'], warn_icons: ['💊', '😴', '🍺', '🥛', '☀️', '💧', '🚽', '🦷', '❄️', '🫧'], allergy_alert: 'หยุดใช้ยาและพบแพทย์ทันที หากมีผื่นคัน หายใจติดขัด หรือมีอาการแพ้', show_card: '🚀 โชว์ Boarding Pass', edit_rx: '⬅️ กลับไปแก้ไข', photo_prompt: '📸 ถ่ายรูปหน้าจอนี้เก็บไว้', write_dob: '✍️ กรุณาเขียนเลขวันเดือนปีเกิดลงในกระดาษ', smart_dose: 'ใช้ครั้งละ {n} {u}', smart_hour: 'ทุกๆ {n} {u}', smart_apply: 'ทาวันละ {n} {u}', smart_days: 'ติดต่อกัน {n} {u}', add_to_cart: '📥 เก็บลงตะกร้า', cart: 'ตะกร้ายา', items: 'รายการ', swipe_hint: 'ปัดหน้าจอเพื่อดูยาชนิดอื่น', scroll_down: '⬇️ เลื่อนลงเพื่อดูคำเตือน ⬇️', taper_mode: '📉 โหมดลดโดส / กินไม่เท่ากัน', standard_mode: 'กลับไปโหมดปกติ', add_step: '➕ เพิ่มขั้น', duration: 'ระยะเวลา', dosage: 'ปริมาณ', time_col: 'มื้ออาหาร / เวลา', rx_title: 'วิธีใช้ยา', warn_title: 'คำเตือน / ข้อควรระวัง', spec_guide: 'คู่มือการใช้ยา (How to Use)' },
  en: { hello: 'Hello 👋', tap_to_select: '👆 Please tap an option', q_name: 'What is your full name?', q_dob: 'What is your date of birth?', q_allergy: 'Are you allergic to any medications?', yes: 'Yes', no: 'No', dont_know: 'Not sure', writePaper: 'Please write it down on paper.', q_inj: 'Did you receive any injections today?', q_med: 'Did you receive any oral medications today?', rx_title: 'Prescription Info', warn_title: 'Warnings', drug_name: 'Medicine:', ind_title: 'Indication:', indication: ['Fever / Pain', 'Allergy / Runny nose', 'Cough', 'Antibiotic', 'Diarrhea', 'Stomachache', 'Nausea / Vomiting', 'Anti-inflammatory / Pain'], ind_icons: ['🤒', '🤧', '🗣️', '🦠', '🚽', '🤢', '🤮', '⚡'], dose: ['Half tablet', '1 Tablet', '2 Tablets', '1 Teaspoon', '1 Tablespoon', '1 Puff', '1 Drop'], side: ['Left eye', 'Right eye', 'Both eyes', 'Left ear', 'Right ear', 'Both ears'], side_icons: ['👁️⬅️', '👁️➡️', '👁️👁️', '👂⬅️', '👂➡️', '👂👂'], freq: ['Once daily', 'Twice daily', '3 times a day', '4 times a day', 'Every 4-6 hours', 'Every 6 hours', 'Every 8 hours'], time: ['Before meal', 'After meal', 'Immediately after meal', 'With/without food'], period: ['Morning', 'Noon', 'Evening', 'Night', 'As needed'], period_icons: ['☀️', '🕛', '🌆', '🌙', '🩹'], warn: ['Finish entire course.', 'May cause drowsiness.', 'Avoid alcohol.', 'Do not take with milk.', 'Avoid strong sunlight.', 'Drink plenty of water.', 'May change urine color.', 'Chew well.', 'Store in refrigerator.', 'Dissolve in water'], warn_icons: ['💊', '😴', '🍺', '🥛', '☀️', '💧', '🚽', '🦷', '❄️', '🫧'], allergy_alert: 'Stop use and seek medical help if you develop a rash or breathing problems.', show_card: '🚀 Show', edit_rx: '⬅️ Edit', photo_prompt: '📸 Take a photo of this screen', write_dob: '✍️ Please write your birth date on paper.', smart_dose: 'Take {n} {u}', smart_hour: 'Every {n} {u}', smart_apply: 'Apply {n} {u} a day', smart_days: 'For {n} {u}', add_to_cart: '📥 Add', cart: 'Cart', items: 'items', swipe_hint: 'Swipe for other meds', scroll_down: '⬇️ Scroll down ⬇️', taper_mode: '📉 Tapering Mode', standard_mode: 'Standard', add_step: '➕ Add Step', duration: 'Duration', dosage: 'Dose', time_col: 'Time', tab_history: '📋 History', tab_dispense: '💊 Dispense', tab_special: '🪄 Specialty', spec_guide: 'How to Use' },
  de: { hello: 'Hallo 👋', tap_to_select: '👆 Bitte tippen', q_name: 'Wie lautet Ihr vollständiger Name?', q_dob: 'Wann ist Ihr Geburtsdatum?', q_allergy: 'Haben Sie Allergien gegen Medikamente?', yes: 'Ja', no: 'Nein', dont_know: 'Weiß nicht', writePaper: 'Bitte aufschreiben.', q_inj: 'Haben Sie heute Injektionen erhalten?', q_med: 'Haben Sie heute Medikamente eingenommen?', rx_title: 'Einnahme', warn_title: 'Warnhinweise', drug_name: 'Medikament:', ind_title: 'Anwendung:', indication: ['Fieber / Schmerzen', 'Allergie / Nase', 'Husten', 'Antibiotikum', 'Durchfall', 'Magen', 'Übelkeit', 'Entzündung / Schmerzen'], ind_icons: ['🤒', '🤧', '🗣️', '🦠', '🚽', '🤢', '🤮', '⚡'], dose: ['Halbe Tablette', '1 Tablette', '2 Tabletten', '1 Teelöffel', '1 Esslöffel', '1 Sprühstoß', '1 Tropfen'], side: ['Linkes Auge', 'Rechtes Auge', 'Beide Augen', 'Linkes Ohr', 'Rechtes Ohr', 'Beide Ohren'], side_icons: ['👁️⬅️', '👁️➡️', '👁️👁️', '👂⬅️', '👂➡️', '👂👂'], freq: ['1x täglich', '2x täglich', '3x täglich', '4x täglich', 'Alle 4-6 Std', 'Alle 6 Std', 'Alle 8 Std'], time: ['Vor dem Essen', 'Nach dem Essen', 'Direkt nach Essen', 'Vor/nach Essen'], period: ['Morgens', 'Mittags', 'Abends', 'Nachts', 'Bei Bedarf'], period_icons: ['☀️', '🕛', '🌆', '🌙', '🩹'], warn: ['Vollständig aufbrauchen.', 'Macht schläfrig.', 'Kein Alkohol.', 'Nicht mit Milch.', 'Sonne meiden.', 'Viel trinken.', 'Verfärbt Urin.', 'Gut kauen.', 'Kühlschrank.', 'In Wasser auflösen'], warn_icons: ['💊', '😴', '🍺', '🥛', '☀️', '💧', '🚽', '🦷', '❄️', '🫧'], allergy_alert: 'Bei Ausschlag sofort zum Arzt.', show_card: '🚀 Zeigen', edit_rx: '⬅️ Zurück', photo_prompt: '📸 Bitte fotografieren', write_dob: '✍️ Bitte schreiben Sie Ihr Geburtsdatum auf.', smart_dose: '{n} {u} nehmen', smart_hour: 'Alle {n} {u}', smart_apply: '{n}x täglich', smart_days: 'Für {n} {u}', add_to_cart: '📥 Hinzufügen', cart: 'Korb', items: 'Artikel', swipe_hint: 'Wischen', scroll_down: '⬇️ Nach unten ⬇️', taper_mode: '📉 Ausschleichen', standard_mode: 'Standard', add_step: '➕ Schritt', duration: 'Dauer', dosage: 'Dosis', time_col: 'Zeit', tab_history: '📋 Verlauf', tab_dispense: '💊 Ausgabe', tab_special: '🪄 Spezial', spec_guide: 'Anwendung' },
  zh: { hello: '你好 👋', tap_to_select: '👆 请点击', q_name: '请问您的全名是什么？', q_dob: '您的出生日期是哪天？', q_allergy: '您对任何药物过敏吗？', yes: '是', no: '否', dont_know: '不清楚', writePaper: '请写下。', q_inj: '您今天接受过注射吗？', q_med: '您今天服用过口服药吗？', rx_title: '服药方法', warn_title: '注意事项', drug_name: '药物：', ind_title: '主治：', indication: ['退烧 / 止痛', '过敏 / 流鼻涕', '咳嗽', '抗生素', '腹泻', '胃痛', '恶心', '消炎 / 止痛'], ind_icons: ['🤒', '🤧', '🗣️', '🦠', '🚽', '🤢', '🤮', '⚡'], dose: ['半粒', '1 粒', '2 粒', '1 茶匙', '1 汤匙', '1 喷', '1 滴'], side: ['左眼', '右眼', '双眼', '左耳', '右耳', '双耳'], side_icons: ['👁️⬅️', '👁️➡️', '👁️👁️', '👂⬅️', '👂➡️', '👂👂'], freq: ['每天 1 次', '每天 2 次', '每天 3 次', '每天 4 次', '每 4-6 小时', '每 6 小时', '每 8 小时'], time: ['饭前', '饭后', '饭后立即', '饭前/饭后'], period: ['早上', '中午', '晚上', '睡前', '需要时'], period_icons: ['☀️', '🕛', '🌆', '🌙', '🩹'], warn: ['服完疗程。', '可能嗜睡。', '避免饮酒。', '勿与牛奶同服。', '避光。', '多喝水。', '改变尿色。', '嚼碎。', '冷藏。', '溶于水'], warn_icons: ['💊', '😴', '🍺', '🥛', '☀️', '💧', '🚽', '🦷', '❄️', '🫧'], allergy_alert: '如出现皮疹或呼吸困难，请立即就医。', show_card: '🚀 显示', edit_rx: '⬅️ 返回', photo_prompt: '📸 请拍照保存', write_dob: '✍️ 请把出生日期写在纸上。', smart_dose: '使用 {n} {u}', smart_hour: '每 {n} {u}', smart_apply: '每天 {n} {u}', smart_days: '连续 {n} {u}', add_to_cart: '📥 加入', cart: '购物车', items: '项', swipe_hint: '滑动', scroll_down: '⬇️ 向下滚动 ⬇️', taper_mode: '📉 递减剂量', standard_mode: '标准', add_step: '➕ 添加', duration: '期间', dosage: '剂量', time_col: '时间', tab_history: '📋 历史', tab_dispense: '💊 配药', tab_special: '🪄 专科', spec_guide: '使用方法' },
  ja: { hello: 'こんにちは 👋', tap_to_select: '👆 選択してください', q_name: 'フルネームを教えてください。', q_dob: '生年月日はいつですか？', q_allergy: '薬のアレルギーはありますか？', yes: 'はい', no: 'いいえ', dont_know: '不明', writePaper: '紙に書いてください。', q_inj: '今日、注射を受けましたか？', q_med: '今日、飲み薬を服用しましたか？', rx_title: '服用方法', warn_title: '注意事項', drug_name: '薬：', ind_title: '効能：', indication: ['解熱 / 鎮痛', 'アレルギー', '咳', '抗生物質', '下痢', '胃痛', '吐き気', '抗炎症 / 痛み'], ind_icons: ['🤒', '🤧', '🗣️', '🦠', '🚽', '🤢', '🤮', '⚡'], dose: ['半分', '1 錠', '2 錠', '小さじ 1', '大さじ 1', '1 プッシュ', '1 滴'], side: ['左目', '右目', '両目', '左耳', '右耳', '両耳'], side_icons: ['👁️⬅️', '👁️➡️', '👁️👁️', '👂⬅️', '👂➡️', '👂👂'], freq: ['1日 1回', '1日 2回', '1日 3回', '1日 4回', '4-6 時間ごと', '6 時間ごと', '8 時間ごと'], time: ['食前', '食後', '食直後', '食前/食後'], period: ['朝', '昼', '夕方', '就寝前', '症状がある時'], period_icons: ['☀️', '🕛', '🌆', '🌙', '🩹'], warn: ['飲みきってください。', '眠気。', '禁酒。', '牛乳不可。', '直射日光を避ける。', '多めの水。', '尿の色変化。', '噛む。', '冷蔵庫。', '水に溶かす'], warn_icons: ['💊', '😴', '🍺', '🥛', '☀️', '💧', '🚽', '🦷', '❄️', '🫧'], allergy_alert: '発疹や息苦しさがあれば直ちに受診してください。', show_card: '🚀 表示', edit_rx: '⬅️ 戻る', photo_prompt: '📸 画面を撮影してください', write_dob: '✍️ 生年月日を紙に書いてください。', smart_dose: '{n} {u} 使用', smart_hour: '{n} {u} ごと', smart_apply: '1日 {n} {u}', smart_days: '{n} {u}間', add_to_cart: '📥 追加', cart: 'カート', items: '個', swipe_hint: 'スワイプ', scroll_down: '⬇️ 下へスクロール ⬇️', taper_mode: '📉 漸減モード', standard_mode: '標準', add_step: '➕ 追加', duration: '期間', dosage: '用量', time_col: '時間', tab_history: '📋 履歴', tab_dispense: '💊 調剤', tab_special: '🪄 特殊', spec_guide: '使い方' },
  ru: { hello: 'Привет 👋', tap_to_select: '👆 Выберите', q_name: 'Как ваше полное имя?', q_dob: 'Какова ваша дата рождения?', q_allergy: 'Есть ли у вас аллергия на лекарства?', yes: 'Да', no: 'Нет', dont_know: 'Не знаю', writePaper: 'Напишите на бумаге.', q_inj: 'Вам сегодня делали уколы?', q_med: 'Принимали ли вы сегодня лекарства внутрь?', rx_title: 'Применение', warn_title: 'Внимание', drug_name: 'Лекарство:', ind_title: 'Показания:', indication: ['Жар / Боль', 'Аллергия', 'Кашель', 'Антибиотик', 'Диарея', 'Боль в животе', 'Тошнота', 'Воспаление / Боль'], ind_icons: ['🤒', '🤧', '🗣️', '🦠', '🚽', '🤢', '🤮', '⚡'], dose: ['Половина', '1 табл.', '2 табл.', '1 ч.л.', '1 ст.л.', '1 пшик', '1 капля'], side: ['Левый глаз', 'Правый глаз', 'Оба глаза', 'Левое ухо', 'Правое ухо', 'Оба уха'], side_icons: ['👁️⬅️', '👁️➡️', '👁️👁️', '👂⬅️', '👂➡️', '👂👂'], freq: ['1 раз в день', '2 раза в день', '3 раза в день', '4 раза в день', 'Каждые 4-6 ч', 'Каждые 6 ч', 'Каждые 8 ч'], time: ['До еды', 'После еды', 'Сразу после', 'Независимо'], period: ['Утром', 'Днем', 'Вечером', 'На ночь', 'По нужде'], period_icons: ['☀️', '🕛', '🌆', '🌙', '🩹'], warn: ['Закончить курс.', 'Сонливость.', 'Без алкоголя.', 'Без молока.', 'Беречь от солнца.', 'Пить воду.', 'Цвет мочи.', 'Жевать.', 'В холодильник.', 'В воду'], warn_icons: ['💊', '😴', '🍺', '🥛', '☀️', '💧', '🚽', '🦷', '❄️', '🫧'], allergy_alert: 'При сыпи или удушье срочно к врачу.', show_card: '🚀 Показать', edit_rx: '⬅️ Назад', photo_prompt: '📸 Сфотографируйте экран', write_dob: '✍️ Напишите дату рождения на бумаге.', smart_dose: 'По {n} {u}', smart_hour: 'Каждые {n} {u}', smart_apply: '{n} раз(а) в день', smart_days: 'На {n} {u}', add_to_cart: '📥 В корзину', cart: 'Корзина', items: 'шт', swipe_hint: 'Свайп', scroll_down: '⬇️ Вниз ⬇️', taper_mode: '📉 Снижение', standard_mode: 'Стандарт', add_step: '➕ Шаг', duration: 'Дней', dosage: 'Доза', time_col: 'Время', tab_history: '📋 История', tab_dispense: '💊 Выдача', tab_special: '🪄 Спец', spec_guide: 'Как использовать' },
  ar: { hello: 'مرحباً 👋', tap_to_select: '👆 اختر', q_name: 'ما هو اسمك الكامل؟', q_dob: 'ما هو تاريخ ميلادك؟', q_allergy: 'هل تعاني من حساسية تجاه أي أدوية؟', yes: 'نعم', no: 'لا', dont_know: 'لا أعرف', writePaper: 'اكتب على ورقة.', q_inj: 'هل تلقيت أي حقن اليوم؟', q_med: 'هل تلقيت أي أدوية عن طريق الفم اليوم؟', rx_title: 'الاستخدام', warn_title: 'تحذيرات', drug_name: 'الدواء:', ind_title: 'دواعي:', indication: ['حمى / ألم', 'حساسية', 'سعال', 'مضاد حيوي', 'إسهال', 'معدة', 'غثيان', 'التهاب / ألم'], ind_icons: ['🤒', '🤧', '🗣️', '🦠', '🚽', '🤢', '🤮', '⚡'], dose: ['نصف', '1 حبة', '2 حبة', '1 ملعقة صغيرة', '1 ملعقة كبيرة', '1 بخة', '1 قطرة'], side: ['يسرى', 'يمنى', 'كلتيهما', 'يسرى', 'يمنى', 'كلتيهما'], side_icons: ['👁️⬅️', '👁️➡️', '👁️👁️', '👂⬅️', '👂➡️', '👂👂'], freq: ['1 يومياً', '2 يومياً', '3 يومياً', '4 يومياً', 'كل 4-6 س', 'كل 6 س', 'كل 8 س'], time: ['قبل الأكل', 'بعد الأكل', 'مباشرة بعد الأكل', 'قبل/بعد الأكل'], period: ['صباح', 'ظهر', 'مساء', 'ليل', 'عند الحاجة'], period_icons: ['☀️', '🕛', '🌆', '🌙', '🩹'], warn: ['أكمل الجرعة.', 'نعاس.', 'لا كحول.', 'لا حليب.', 'تجنب الشمس.', 'اشرب ماء.', 'لون البول.', 'امضغ.', 'ثلاجة.', 'في الماء'], warn_icons: ['💊', '😴', '🍺', '🥛', '☀️', '💧', '🚽', '🦷', '❄️', '🫧'], allergy_alert: 'توقف فوراً عند ظهور طفح جلدي أو ضيق تنفس.', show_card: '🚀 عرض', edit_rx: '⬅️ رجوع', photo_prompt: '📸 يرجى تصوير الشاشة', write_dob: '✍️ يرجى كتابة تاريخ ميلادك على الورق.', smart_dose: 'استخدم {n} {u}', smart_hour: 'كل {n} {u}', smart_apply: '{n} يومياً', smart_days: 'لمدة {n} {u}', add_to_cart: '📥 إضافة', cart: 'سلة', items: 'عناصر', swipe_hint: 'اسحب', scroll_down: '⬇️ أسفل ⬇️', taper_mode: '📉 تقليل', standard_mode: 'عادي', add_step: '➕ خطوة', duration: 'المدة', dosage: 'الجرعة', time_col: 'الوقت', tab_history: '📋 سجل', tab_dispense: '💊 صرف', tab_special: '🪄 تخصص', spec_guide: 'الاستخدام' }
};

type Lang = keyof typeof dict;
type AppMode = 'history' | 'dispense' | 'specialty';
type DispenseState = 'input' | 'present'; 

type TaperStep = {
  days: number; dose: string | number; unit: string; time: number | null; periods: number[];
};

type Prescription = {
  drugInput: string; drugName: string;
  rxIndication: number | null; customIndication: string;
  isTapering: boolean; taperSteps: TaperStep[];
  rxDose: number | null; rxSide: number | null; rxFreq: number | null; rxTime: number | null; rxPeriod: number[]; 
  rxWarnings: number[]; customWarnings: string[];
  cDose: string | number; cDoseUnit: string; cHour: string | number; cHourUnit: string;
  cApply: string | number; cApplyUnit: string; cDays: string | number; cDaysUnit: string;
};

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'United Kingdom' }, 
  { code: 'de', flag: '🇩🇪', label: 'Germany' },
  { code: 'ru', flag: '🇷🇺', label: 'Russia' }, 
  { code: 'zh', flag: '🇨🇳', label: 'China' },
  { code: 'ja', flag: '🇯🇵', label: 'Japan' }, 
  { code: 'ar', flag: '🇦🇪', label: 'UAE' },
];

const encodeData = (data: any) => {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
};

const decodeData = (str: string) => {
    try {
        return JSON.parse(decodeURIComponent(escape(atob(str))));
    } catch(e) {
        return null;
    }
};

export default function PharmaLingoApp() {
  const [hasStarted, setHasStarted] = useState(false);
  const [animatingLang, setAnimatingLang] = useState<string | null>(null); 
  const [patientLang, setPatientLang] = useState<Lang>('en');
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  
  const [appMode, setAppMode] = useState<AppMode>('history');
  const [dispenseState, setDispenseState] = useState<DispenseState>('input'); 
  const [isFullscreen, setIsFullscreen] = useState(false); 
  
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [boolAnswer, setBoolAnswer] = useState<string | null>(null); 
  const [activeGuide, setActiveGuide] = useState<any>(null);

  const [cart, setCart] = useState<Prescription[]>([]);

  const [drugInput, setDrugInput] = useState('');
  const [drugName, setDrugName] = useState('');
  const [isTranslatingDrug, setIsTranslatingDrug] = useState(false);
  const [rxIndication, setRxIndication] = useState<number | null>(null);
  const [indInput, setIndInput] = useState('');
  const [customIndication, setCustomIndication] = useState('');
  const [isTranslatingInd, setIsTranslatingInd] = useState(false);

  const [isTaperingMode, setIsTaperingMode] = useState(false);
  const [taperSteps, setTaperSteps] = useState<TaperStep[]>([{ days: 3, dose: 1, unit: 'tab', time: null, periods: [0] }]);

  const [rxDose, setRxDose] = useState<number | null>(null);
  const [rxSide, setRxSide] = useState<number | null>(null);
  const [rxFreq, setRxFreq] = useState<number | null>(null);
  const [rxTime, setRxTime] = useState<number | null>(null);
  const [rxPeriod, setRxPeriod] = useState<number[]>([]); 
  const [rxWarnings, setRxWarnings] = useState<number[]>([]);
  
  const [isSmartOpen, setIsSmartOpen] = useState(false); 
  const [cDose, setCDose] = useState<string | number>(0);
  const [cDoseUnit, setCDoseUnit] = useState<string>('tab');
  const [cHour, setCHour] = useState<string | number>(0);
  const [cHourUnit, setCHourUnit] = useState<string>('hr');
  const [cApply, setCApply] = useState<string | number>(0);
  const [cApplyUnit, setCApplyUnit] = useState<string>('times');
  const [cDays, setCDays] = useState<string | number>(0);
  const [cDaysUnit, setCDaysUnit] = useState<string>('day');

  const [warnInput, setWarnInput] = useState('');
  const [customWarnings, setCustomWarnings] = useState<string[]>([]);
  const [isTranslatingWarn, setIsTranslatingWarn] = useState(false);

  const [customText, setCustomText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const [shortLink, setShortLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  
  const [isSharedLink, setIsSharedLink] = useState(false);

  useEffect(() => { 
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis; 
      synthRef.current.getVoices(); 
      window.speechSynthesis.onvoiceschanged = () => {
        synthRef.current?.getVoices();
      };

      const params = new URLSearchParams(window.location.search);
      const rxData = params.get('rx');
      if (rxData) {
        const decoded = decodeData(rxData);
        if (decoded && decoded.cart) {
          setCart(decoded.cart);
          if (decoded.lang) setPatientLang(decoded.lang);
          setHasStarted(true);
          setDispenseState('present');
          setIsFullscreen(true);
          setIsSharedLink(true); 
        }
      }
    }
  }, []);

  const generatePrintLink = async () => {
    setIsGeneratingLink(true);
    setShowLinkModal(true);
    try {
      const payload = { cart, lang: patientLang };
      const encodedUrl = encodeData(payload);
      const longUrl = window.location.origin + '?rx=' + encodedUrl;
      
      const res = await fetch("https://is.gd/create.php?format=json&url=" + encodeURIComponent(longUrl));
      const data = await res.json();
      
      if (data.shorturl) {
        setShortLink(data.shorturl.replace('https://', ''));
      } else {
        setShortLink('Error: Link generation failed');
      }
    } catch (err) {
      setShortLink('Error: Connection failed');
    }
    setIsGeneratingLink(false);
  };

  const speakText = (text: string, langCode: string, forceEnglish: boolean = false) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    
    let cleanText = text.split('ч.л.').join('чайная ложка')
                        .split('ст.л.').join('столовая ложка')
                        .split('табл.').join('таблетка')
                        .split('капс.').join('капсула')
                        .split('(s)').join('')
                        .split('(n)').join('');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = synthRef.current.getVoices();
    
    const exactLangMap: any = { ar: 'ar-SA', de: 'de-DE', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP', ru: 'ru-RU' };
    const targetLangMatch = forceEnglish ? 'en-US' : (exactLangMap[langCode] || langCode);
    
    let filteredVoices = voices.filter(v => v.lang.toLowerCase().startsWith(targetLangMatch.toLowerCase()));

    if (filteredVoices.length === 0) {
      filteredVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
    }

    const fNames = ['female', 'siri', 'kyoko', 'samantha', 'laila', 'ting', 'meijia', 'anna', 'helena', 'milena', 'karen', 'amelie', 'yuna', 'monica', 'katya'];
    const mNames = ['male', 'siri', 'otoya', 'aaron', 'maged', 'tarik', 'yushu', 'daniel', 'arthur', 'martin', 'yuri', 'pavel'];

    const findVoice = (isPremiumOnly: boolean) => {
      return filteredVoices.find(v => {
        const name = v.name.toLowerCase();
        const isPremium = name.includes('siri') || name.includes('premium') || name.includes('enhanced') || name.includes('natural');
        if (isPremiumOnly && !isPremium) return false;
        const isFemale = fNames.some(f => name.includes(f));
        const isMale = mNames.some(m => name.includes(m));
        if (voiceGender === 'male') return isMale || (!isFemale && name.includes('male'));
        return isFemale || (!isMale && name.includes('female'));
      });
    };

    let preferredVoice = findVoice(true); 
    if (!preferredVoice) preferredVoice = findVoice(false); 
    if (!preferredVoice && filteredVoices.length > 0) preferredVoice = filteredVoices[0]; 

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang; 
    } else {
      utterance.lang = targetLangMatch;
    }

    utterance.rate = 0.85; 
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };

  // ✅ ฟังก์ชันตรวจเช็คตัวเลข (แทนที่ Regex)
  const checkIsNumber = (val: string) => {
      if (val === '') return true;
      return !isNaN(Number(val)) && !val.includes('.');
  };

  const checkIsDecimal = (val: string) => {
      if (val === '') return true;
      return !isNaN(Number(val));
  };

  const handleTaperDaysChange = (idx: number, val: string) => {
    if (checkIsNumber(val)) {
      const ns = [...taperSteps];
      ns[idx].days = Number(val);
      setTaperSteps(ns);
    }
  };

  const handleTaperDoseChange = (idx: number, val: string) => {
    if (checkIsDecimal(val)) {
      const ns = [...taperSteps];
      ns[idx].dose = val;
      setTaperSteps(ns);
    }
  };

  const handleNumberInput = (setter: any, value: string) => { 
      if (checkIsDecimal(value)) {
          setter(value); 
      }
  };

  const togglePeriod = (index: number) => setRxPeriod(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index].sort());
  const toggleWarning = (index: number) => setRxWarnings(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);

  const handleTranslate = async () => {
    if (!customText.trim()) return;
    setIsTranslating(true);
    try {
      const langMap: any = { th: 'th', en: 'en', de: 'de', zh: 'zh-CN', ja: 'ja', ru: 'ru', ar: 'ar' };
      const targetLang = langMap[patientLang];
      const res = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=th&tl=" + targetLang + "&dt=t&q=" + encodeURIComponent(customText));
      const data = await res.json(); 
      setTranslatedText(data[0][0][0]); 
      setActiveQuestion('custom_msg'); 
      setAppMode('history'); 
      speakText(data[0][0][0], patientLang); 
      setCustomText('');
    } catch (error) { console.error(error); }
    setIsTranslating(false);
  };

  const speakSpecificRx = (rx: Prescription) => {
    if (!synthRef.current) return;
    const text = generateSpeechText(rx);
    if (text) speakText(text.split('|').join(','), patientLang);
  };

  const speakSpecificWarnings = (rx: Prescription) => {
    if (!synthRef.current) return;
    const text = generateWarningsSpeechText(rx);
    if (text) speakText(text, patientLang);
  };

  const speakGuide = (guide: any) => {
    if (!synthRef.current) return;
    let text = (guide.title[patientLang] || guide.title.en) + ".\n";
    guide.steps.forEach((step: any, i: number) => {
       text += "Step " + (i + 1) + ": " + (step.desc[patientLang] || step.desc.en) + ".\n";
    });
    speakText(text, patientLang);
  };

  const p = dict[patientLang] as any;
  const th = dict.th as any;
  const isRTL = patientLang === 'ar';

  const toggleHistorySpeech = () => {
    if (!synthRef.current) return;
    if (isSpeaking || synthRef.current.speaking) { 
      synthRef.current.cancel(); 
      setIsSpeaking(false); 
    } else {
      const text = activeQuestion ? p[activeQuestion] : translatedText;
      speakText(text, patientLang);
    }
  };

  const handleLangSelect = (code: string, label: string) => { 
    setPatientLang(code as Lang); 
    setAnimatingLang(code); 
    speakText(label, 'en', true);
    setTimeout(() => { setHasStarted(true); setAnimatingLang(null); }, 1000); 
  };

  const askQuestion = (qId: string) => { 
    setAppMode('history'); 
    setActiveQuestion(qId); 
    setTranslatedText(''); 
    setBoolAnswer(null); 
    speakText(p[qId], patientLang); 
  };
  
  const parseSmartText = (template: string, value: string | number, unitKey: string) => { 
    const numValue = Number(value) || 0; 
    return template.split('{n}').join(numValue.toString()).split('{u}').join(unitDict[unitKey][patientLang]); 
  };

  const translateDrugName = async () => {
    if (!drugInput.trim()) return;
    setIsTranslatingDrug(true);
    try {
      const langMap: any = { th: 'th', en: 'en', de: 'de', zh: 'zh-CN', ja: 'ja', ru: 'ru', ar: 'ar' };
      const targetLang = langMap[patientLang];
      const res = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=th&tl=" + targetLang + "&dt=t&q=" + encodeURIComponent(drugInput));
      const data = await res.json(); setDrugName(data[0][0][0]);
    } catch (error) { console.error(error); }
    setIsTranslatingDrug(false);
  };

  const translateIndication = async () => {
    if (!indInput.trim()) return;
    setIsTranslatingInd(true);
    try {
      const langMap: any = { th: 'th', en: 'en', de: 'de', zh: 'zh-CN', ja: 'ja', ru: 'ru', ar: 'ar' };
      const targetLang = langMap[patientLang];
      const res = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=th&tl=" + targetLang + "&dt=t&q=" + encodeURIComponent(indInput));
      const data = await res.json(); setCustomIndication(data[0][0][0]); setIndInput(''); setRxIndication(null); 
    } catch (error) { console.error(error); }
    setIsTranslatingInd(false);
  };

  const translateWarning = async () => {
    if (!warnInput.trim()) return;
    setIsTranslatingWarn(true);
    try {
      const langMap: any = { th: 'th', en: 'en', de: 'de', zh: 'zh-CN', ja: 'ja', ru: 'ru', ar: 'ar' };
      const targetLang = langMap[patientLang];
      const res = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=th&tl=" + targetLang + "&dt=t&q=" + encodeURIComponent(warnInput));
      const data = await res.json(); setCustomWarnings([...customWarnings, data[0][0][0]]); setWarnInput('');
    } catch (error) { console.error(error); }
    setIsTranslatingWarn(false);
  };

  const removeCustomWarning = (index: number) => setCustomWarnings(customWarnings.filter((_, i) => i !== index));

  const addToCart = () => {
    const newItem: Prescription = {
      drugInput, drugName, rxIndication, customIndication, isTapering: isTaperingMode, taperSteps: [...taperSteps],
      rxDose, rxSide, rxFreq, rxTime, rxPeriod: [...rxPeriod], rxWarnings: [...rxWarnings], customWarnings: [...customWarnings],
      cDose, cDoseUnit, cHour, cHourUnit, cApply, cApplyUnit, cDays, cDaysUnit
    };
    setCart([...cart, newItem]);
    resetFormOnly();
  };

  const resetFormOnly = () => {
    setDrugInput(''); setDrugName(''); setRxIndication(null); setCustomIndication(''); setIndInput('');
    setIsTaperingMode(false); setTaperSteps([{ days: 3, dose: 1, unit: 'tab', time: null, periods: [0] }]);
    setRxDose(null); setRxSide(null); setRxFreq(null); setRxTime(null); setRxPeriod([]);  
    setRxWarnings([]); setCustomWarnings([]); setWarnInput('');
    setCDose(0); setCHour(0); setCApply(0); setCDays(0); setIsSmartOpen(false);
  };

  const clearAll = () => { 
    resetFormOnly(); 
    setCart([]); 
    setDispenseState('input'); 
    setIsFullscreen(false); 
    setActiveGuide(null); 
    if(synthRef.current) synthRef.current.cancel(); 
    setIsSpeaking(false); 
  };

  const showBoardingPass = () => {
    if (drugInput || rxIndication !== null || rxDose !== null || isTaperingMode) addToCart();
    setDispenseState('present'); setIsFullscreen(true); setIsSpeaking(false);
    if(synthRef.current) synthRef.current.cancel(); 
  };

  const generateSpeechText = (rx: Prescription) => {
    if (!rx) return '';
    let parts = []; 
    let drugText = rx.drugName ? p.drug_name + " " + rx.drugName + ".\n" : ''; 
    let indText = '';
    if (rx.rxIndication !== null) indText = p.indication[rx.rxIndication] + '. ';
    if (rx.customIndication) indText = rx.customIndication + '. ';

    if (rx.isTapering) { 
      parts.push('Complex Tapering Dosing.'); 
    } else {
      if (rx.rxDose !== null) parts.push(p.dose[rx.rxDose]);
      if (Number(rx.cDose) > 0) parts.push(parseSmartText(p.smart_dose, rx.cDose, rx.cDoseUnit));
      if (rx.rxFreq !== null) parts.push(p.freq[rx.rxFreq]);
      if (Number(rx.cHour) > 0) parts.push(parseSmartText(p.smart_hour, rx.cHour, rx.cHourUnit));
      if (Number(rx.cApply) > 0) parts.push(parseSmartText(p.smart_apply, rx.cApply, rx.cApplyUnit));
      if (rx.rxTime !== null) parts.push(p.time[rx.rxTime]); 
      if (rx.rxPeriod.length > 0) parts.push(rx.rxPeriod.map(i => p.period[i]).join(', '));
      if (Number(rx.cDays) > 0) parts.push(parseSmartText(p.smart_days, rx.cDays, rx.cDaysUnit));
      if (rx.rxSide !== null) parts.push(p.side[rx.rxSide]); 
    }
    return drugText + indText + (parts.length > 0 ? parts.join(' | ') + '.\n' : '');
  };

  const generateWarningsSpeechText = (rx: Prescription) => {
    if (!rx) return '';
    let text = '';
    if (rx.rxWarnings.length > 0 || rx.customWarnings.length > 0) {
      text += p.warn_title + ':\n';
      rx.rxWarnings.forEach(w => text += p.warn[w] + '\n');
      rx.customWarnings.forEach(cw => text += cw + '\n');
    }
    text += p.allergy_alert + '\n';
    return text;
  };

  if (!hasStarted) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#0f172a] flex flex-col items-center justify-center relative overflow-hidden font-sans">
        <div className={"absolute top-10 md:top-20 text-center z-20 transition-opacity duration-300 " + (animatingLang ? "opacity-0" : "opacity-100")}>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-widest drop-shadow-md">ASSISTANCE DISPENSER</h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base font-bold tracking-widest uppercase">Tap to Select Patient Language</p>
        </div>

        <div className="relative w-[300px] h-[300px] flex items-center justify-center mt-12 md:mt-20">
          <div className={"absolute w-full h-full rounded-full border-[4px] border-slate-800 transition-opacity duration-300 " + (animatingLang ? "opacity-0" : "opacity-100")}></div>
          {LANGUAGES.map((l, index) => {
            const rotation = index * 60; 
            const isAnimating = animatingLang === l.code;
            const isOther = animatingLang && animatingLang !== l.code;
            return (
              <button key={l.code} onClick={() => handleLangSelect(l.code, l.label)}
                className={"absolute top-1/2 left-1/2 w-20 h-20 -ml-10 -mt-10 flex flex-col items-center justify-center outline-none transition-all duration-[800ms] ease-[cubic-bezier(0.8,0,0.2,1)] " + (isOther ? "opacity-0 scale-0 " : " ") + (isAnimating ? "z-50" : "z-10 hover:scale-110 cursor-pointer")}
                style={isAnimating ? { transform: 'translate(0px, 0px) scale(80)' } : { transform: "rotate(" + rotation + "deg) translateY(-150px)" }}
              >
                <div className={"flex flex-col items-center justify-center w-full h-full rounded-full transition-all duration-300 " + (isAnimating ? "bg-slate-50" : "")} style={{ transform: "rotate(" + (-rotation) + "deg)" }}>
                  <div className={"transition-all duration-[800ms] " + (isAnimating ? "text-[1px] opacity-0" : "text-5xl")}>{l.flag}</div>
                  <span className={"mt-2 font-black text-[10px] md:text-xs bg-slate-900/80 px-3 py-1 rounded-md border text-slate-300 border-slate-700 whitespace-nowrap " + (isAnimating ? "opacity-0" : "opacity-100")}>{l.label}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className={"absolute bottom-10 z-20 flex gap-4 transition-opacity duration-300 " + (animatingLang ? "opacity-0" : "opacity-100")}>
            <button onClick={() => setVoiceGender('female')} className={"px-6 py-3 rounded-full font-black text-sm md:text-base transition-colors duration-100 border-2 " + (voiceGender === 'female' ? "bg-pink-600 text-white border-pink-400 shadow-[0_0_15px_rgba(219,39,119,0.5)]" : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700")}>👩🏻 Female Voice</button>
            <button onClick={() => setVoiceGender('male')} className={"px-6 py-3 rounded-full font-black text-sm md:text-base transition-colors duration-100 border-2 " + (voiceGender === 'male' ? "bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700")}>👨🏻 Male Voice</button>
        </div>
      </div>
    );
  }

  let patientHeightClass = 'h-[25dvh] p-6 print-hidden'; 
  if (appMode === 'history' && activeQuestion) patientHeightClass = 'h-[75dvh] p-6 print-hidden'; 
  if (appMode === 'dispense' && dispenseState === 'input') patientHeightClass = 'h-[8dvh] p-2 print-hidden'; 

  // Guide Card Rendering
  const renderGuideCard = (guide: any) => {
    return (
      <div className="w-full h-fit max-h-[85dvh] lg:max-w-4xl bg-white lg:rounded-[2rem] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border-4 border-teal-200 print-max-h-none" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-gradient-to-r from-teal-700 to-emerald-900 p-4 md:p-6 text-center relative shrink-0 flex justify-between items-center shadow-inner print-bg-teal-800 print-border-b-2 print-border-teal-800">
          <span className="text-4xl opacity-30 print-icon print-text-white">🪄</span>
          <div className="flex flex-col items-center">
            <h1 className="text-white font-black text-lg md:text-xl tracking-widest uppercase print-text-white">Bangkok Pattaya Hospital</h1>
            <p className="text-teal-200 text-sm md:text-base font-bold mt-1 tracking-widest print-text-white">{p.spec_guide}</p>
          </div>
          <button onClick={() => speakGuide(guide)} className={"w-12 h-12 md:w-14 md:h-14 rounded-full text-2xl shadow-lg flex items-center justify-center print-hidden " + (isSpeaking ? "bg-white text-teal-600 animate-pulse" : "bg-teal-800 text-white border-2 border-teal-400 hover:bg-teal-700")}>
            {isSpeaking ? '🛑' : '🔊'}
          </button>
        </div>
        <div className="bg-teal-50/30 flex flex-col lg:flex-row gap-4 flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar print-overflow-visible">
          <div className="lg:flex-1 bg-gradient-to-r from-teal-100 to-emerald-100 border-2 border-teal-400 rounded-3xl p-5 flex items-center justify-center gap-4 shadow-sm print-border-teal-800 print-border-2">
            <span className="text-6xl md:text-7xl drop-shadow-md">{guide.icon}</span>
            <span className="text-teal-900 font-black text-2xl md:text-3xl leading-tight">{guide.title[patientLang] || guide.title.en}</span>
          </div>
          <div className="flex flex-col lg:flex-1 lg:grid lg:grid-cols-2 gap-3 mt-2 lg:mt-0">
            {guide.steps.map((step: any, sIdx: number) => (
              <div key={sIdx} className="flex items-center gap-4 bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-teal-100/50 print-border-teal-200 print-border">
                <div className="text-4xl md:text-5xl shrink-0 drop-shadow-sm">{step.icon}</div>
                <div className="flex flex-col leading-tight">
                  <span className="text-teal-500 text-xs font-black uppercase tracking-widest mb-1 print-text-teal-700">Step {sIdx + 1}</span>
                  <span className="font-black text-base md:text-lg text-slate-800">{step.desc[patientLang] || step.desc.en}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Boarding Pass Rendering
  const renderBoardingPass = (rx: Prescription, index: number) => {
    const displayDrugEn = rx.drugInput.trim();
    const displayDrugLocal = rx.drugName && rx.drugName.toLowerCase() !== rx.drugInput.toLowerCase() ? rx.drugName : '';
    
    let instCount = 0;
    if (rx.rxDose !== null || Number(rx.cDose) > 0) instCount++; 
    if (rx.rxFreq !== null || Number(rx.cHour) > 0 || Number(rx.cApply) > 0) instCount++;
    if (rx.rxTime !== null || Number(rx.cDays) > 0) instCount++; 
    if (rx.rxPeriod.length > 0) instCount++;
    if (rx.rxSide !== null) instCount++;
    
    const isCrowded = instCount >= 4;
    const instPadding = isCrowded ? "p-3 md:p-4 print-p-1" : "p-4 md:p-5 print-p-2"; 
    const instGap = isCrowded ? "gap-2 md:gap-3 print-gap-1" : "gap-3 md:gap-4 print-gap-1-5";
    const instTextSize = isCrowded ? "text-lg md:text-2xl print-text-sm" : "text-xl md:text-3xl print-text-md";
    const iconSizeClass = isCrowded ? "text-3xl md:text-4xl print-icon" : "text-4xl md:text-5xl print-icon";
    
    const warnCount = rx.rxWarnings.length + rx.customWarnings.length;
    const isWarnCrowded = warnCount >= 4;
    const warnPadding = isWarnCrowded ? "p-3 md:p-4 print-p-1" : "p-4 md:p-5 print-p-2"; 
    const warnGap = isWarnCrowded ? "gap-2 md:gap-3 print-gap-1" : "gap-3 md:gap-4 print-gap-1-5";
    const warnTextSize = isWarnCrowded ? "text-base md:text-xl print-text-sm" : "text-lg md:text-2xl print-text-md";
    const warnIconClass = isWarnCrowded ? "text-3xl md:text-4xl print-icon" : "text-4xl md:text-5xl print-icon";

    return (
      <div key={index} data-index={index} className="w-full h-full flex-shrink-0 snap-center overflow-x-hidden overflow-y-auto snap-y snap-mandatory hide-scrollbar transform-gpu print-card-container print-overflow-hidden print-break-inside-avoid print-mb-0 print-p-0" style={{ WebkitOverflowScrolling: 'touch' }} dir={isRTL ? 'rtl' : 'ltr'}>
        
        {/* Flexbox Layout for Print */}
        <div className="w-full h-full flex flex-col snap-y snap-mandatory print-rx-layout">
            
          {/* Blue Card */}
          <div className="w-full h-full min-h-[100dvh] flex items-center justify-center p-4 snap-center print-p-0 print-min-h-0 print-block print-h-full print-w-full print-half print-card-wrapper">
            <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl h-full max-h-[85dvh] flex flex-col bg-white rounded-[2rem] shadow-2xl border-2 border-blue-100 overflow-hidden print-max-h-full print-w-full print-break-inside-avoid print-border-2 print-border-blue-900 print-rounded-2xl print-h-full print-shadow-none print-rx-card">
              
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 md:p-6 text-center relative shrink-0 flex justify-between items-center shadow-inner print-bg-blue print-header print-p-2">
                <span className="text-4xl md:text-5xl opacity-20 print-icon print-text-white">🏥</span>
                <div className="flex flex-col items-center w-full">
                  <h1 className="text-white font-black text-base md:text-xl tracking-widest uppercase print-text-white print-text-1rem leading-tight">Bangkok Pattaya Hospital</h1>
                  <p className="text-blue-200 text-xs md:text-sm font-bold mt-0.5 tracking-widest print-text-white print-text-07rem">{p.rx_title}</p>
                </div>
                <button onClick={() => speakSpecificRx(rx)} className={"w-12 h-12 md:w-14 md:h-14 rounded-full text-xl md:text-2xl shadow-md flex items-center justify-center print-hidden " + (isSpeaking ? "bg-white text-blue-600 animate-pulse" : "bg-blue-800 text-white border border-blue-400 hover:bg-blue-700")}>
                  {isSpeaking ? '🛑' : '🔊'}
                </button>
              </div>

              <div className={"bg-blue-50/40 flex flex-col " + instGap + " p-4 md:p-6 min-h-0 overflow-y-auto custom-scrollbar flex-1 print-overflow-hidden print-bg-transparent print-p-2"}>
                {(displayDrugEn || displayDrugLocal) && (
                  <div className={"bg-gradient-to-r from-amber-100 to-yellow-200 border-2 border-yellow-400 rounded-2xl " + (isCrowded ? "py-2 px-2 print-py-1" : "py-4 px-3 print-py-1-5") + " flex flex-col items-center justify-center shadow-sm text-center shrink-0 print-box print-bg-yellow-50"}>
                    <span className={"text-yellow-800 font-black uppercase mb-1 tracking-widest " + (isCrowded ? "text-xs md:text-sm print-text-06rem" : "text-sm md:text-base print-text-07rem")}>💊 {p.drug_name}</span>
                    <div className="flex flex-col items-center justify-center w-full px-1 gap-1 print-gap-1">
                      {displayDrugLocal && <FittedText text={displayDrugLocal} isMain={true} />}
                      {displayDrugEn && <FittedText text={displayDrugLocal ? "(" + displayDrugEn + ")" : displayDrugEn} isMain={!displayDrugLocal} />}
                    </div>
                  </div>
                )}

                {(rx.rxIndication !== null || rx.customIndication) && (
                  <div className={"bg-blue-100 border-l-8 border-blue-500 rounded-r-xl " + (isCrowded ? "p-3 print-p-1" : "p-4 md:p-5 print-p-1-5") + " flex items-center gap-3 shadow-sm shrink-0 print-box print-bg-blue-50"}>
                    <span className={iconSizeClass + " shrink-0"}>🎯</span>
                    <div className="flex flex-col">
                      <span className={"text-blue-600 uppercase font-black " + (isCrowded ? "text-xs md:text-sm print-text-055rem" : "text-sm md:text-base print-text-065rem")}>{p.ind_title}</span>
                      <span className={"text-blue-900 font-black mt-1 leading-tight " + (isCrowded ? "text-xl md:text-2xl print-text-sm" : "text-2xl md:text-3xl print-text-md")}>{rx.rxIndication !== null ? p.indication[rx.rxIndication] : rx.customIndication}</span>
                    </div>
                  </div>
                )}

                {rx.isTapering ? (
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex-1 print-box" style={{flexDirection:'column', alignItems:'stretch'}}>
                    <div className="text-indigo-600 font-black text-xs md:text-base uppercase mb-2 text-center border-b pb-2 print-text-08rem">📉 {p.taper_mode}</div>
                    <div className="flex-1 overflow-x-auto print-overflow-hidden">
                      <table className="w-full text-center border-collapse">
                        <thead>
                          <tr className="text-slate-400 text-[10px] md:text-sm uppercase border-b-2 print-text-08rem">
                            <th className="pb-2 text-left">💊 {p.dosage}</th>
                            <th className="pb-2">🍽️ {p.time_col}</th>
                            <th className="pb-2 text-right">🗓️ {p.duration}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rx.taperSteps.map((step, idx) => (
                            <tr key={idx} className="border-b border-slate-50 last:border-0 print-border-slate-200">
                              <td className="py-2 font-black text-sm md:text-lg text-blue-600 text-left print-text-1rem">{step.dose} {unitDict[step.unit][patientLang]}</td>
                              <td className="py-2 text-xs md:text-sm print-text-08rem">
                                 <div className="text-teal-600 font-bold">{step.time !== null && p.time[step.time]}</div>
                                 <div className="text-orange-600 font-bold">{step.periods.map(i => th.period_icons[i] + " " + p.period[i]).join(', ')}</div>
                              </td>
                              <td className="py-2 font-black text-sm md:text-lg text-slate-700 text-right print-text-1rem">{step.days} {p.day}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className={"flex flex-col " + instGap + " print-flex-1 print-justify-center"}>
                    {(rx.rxDose !== null || Number(rx.cDose) > 0) && (
                      <div className={"flex items-center gap-4 bg-white rounded-xl shadow-sm border border-slate-100 " + instPadding + " print-box print-bg-white"}>
                        <span className={iconSizeClass}>💊</span>
                        <div className={"flex flex-wrap items-center gap-2 font-black text-slate-800 " + instTextSize + " leading-tight"}>
                          <span>{rx.rxDose !== null ? p.dose[rx.rxDose] : parseSmartText(p.smart_dose, rx.cDose, rx.cDoseUnit)}</span>
                        </div>
                      </div>
                    )}
                    
                    {(rx.rxFreq !== null || Number(rx.cHour) > 0 || Number(rx.cApply) > 0) && (
                      <div className={"flex items-center gap-4 bg-white rounded-xl shadow-sm border border-slate-100 " + instPadding + " print-box print-bg-white"}>
                        <span className={iconSizeClass}>🔄</span>
                        <span className={"font-black text-slate-800 " + instTextSize + " leading-tight"}>
                          {rx.rxFreq !== null && <div>{p.freq[rx.rxFreq]}</div>}
                          {Number(rx.cHour) > 0 && <div className="text-indigo-600">{parseSmartText(p.smart_hour, rx.cHour, rx.cHourUnit)}</div>}
                          {Number(rx.cApply) > 0 && <div className="text-indigo-600">{parseSmartText(p.smart_apply, rx.cApply, rx.cApplyUnit)}</div>}
                        </span>
                      </div>
                    )}

                    {(rx.rxTime !== null || Number(rx.cDays) > 0) && (
                      <div className={"flex items-center gap-4 bg-white rounded-xl shadow-sm border border-slate-100 " + instPadding + " print-box print-bg-white"}>
                        <span className={iconSizeClass}>🍽️</span>
                        <span className={"font-black text-slate-800 " + instTextSize + " leading-tight"}>
                          {rx.rxTime !== null && <div>{p.time[rx.rxTime]}</div>}
                          {Number(rx.cDays) > 0 && <div className="text-emerald-600 mt-1 print-mt-0 print-text-065rem">{parseSmartText(p.smart_days, rx.cDays, rx.cDaysUnit)}</div>}
                        </span>
                      </div>
                    )}

                    {rx.rxPeriod.length > 0 && (
                      <div className="flex flex-wrap gap-2 print-gap-1 print-box print-bg-transparent print-border-none print-p-0">
                        {rx.rxPeriod.map((i: number) => (
                          <span key={i} className={"bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-black border border-orange-200 shadow-sm print-px-1-5 print-py-0-5 print-rounded-md print-border " + (isCrowded ? "text-base md:text-lg print-text-07rem" : "text-lg md:text-xl print-text-09rem")}>
                            {p.period_icons[i]} {p.period[i]}
                          </span>
                        ))}
                      </div>
                    )}

                    {rx.rxSide !== null && (
                      <div className={"flex items-center gap-4 bg-white rounded-xl shadow-sm border border-slate-100 print-box print-bg-white print-mt-auto " + instPadding}>
                        <span className={iconSizeClass}>🧭</span>
                        <span className={"font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 print-px-1-5 print-py-0-5 " + (isCrowded ? "text-base md:text-lg print-text-07rem" : "text-lg md:text-xl print-text-09rem")}>
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
          <div className="w-full h-full min-h-[100dvh] flex items-center justify-center p-4 snap-center print-p-0 print-min-h-0 print-block print-h-full print-w-full print-half print-card-wrapper">
            <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl h-full max-h-[85dvh] flex flex-col bg-white rounded-[2rem] shadow-2xl border-2 border-red-200 overflow-hidden print-max-h-full print-w-full print-break-inside-avoid print-border-2 print-border-red-900 print-rounded-2xl print-h-full print-shadow-none print-rx-card">
              
              <div className="bg-gradient-to-r from-red-800 to-rose-900 p-4 md:p-6 text-center relative shrink-0 flex justify-between items-center shadow-inner print-bg-red print-header print-p-2">
                <span className="text-4xl md:text-5xl opacity-20 print-icon print-text-white">⚠️</span>
                <div className="flex flex-col items-center w-full">
                  <h1 className="text-white font-black text-base md:text-xl tracking-widest uppercase print-text-white print-text-1rem leading-tight">Bangkok Pattaya Hospital</h1>
                  <p className="text-red-200 text-xs md:text-sm font-bold mt-0.5 tracking-widest print-text-white print-text-08rem">{p.warn_title}</p>
                </div>
                <button onClick={() => speakSpecificWarnings(rx)} className={"w-12 h-12 md:w-14 md:h-14 rounded-full text-xl md:text-2xl shadow-md flex items-center justify-center print-hidden " + (isSpeaking ? "bg-white text-red-600 animate-pulse" : "bg-red-800 text-white border border-red-400 hover:bg-red-700")}>
                  {isSpeaking ? '🛑' : '🔊'}
                </button>
              </div>

              <div className={"bg-red-50/60 flex flex-col " + warnGap + " p-4 md:p-6 min-h-0 overflow-y-auto custom-scrollbar flex-1 print-overflow-hidden print-bg-transparent print-p-2"}>
                <h3 className="text-red-600 font-black text-xs md:text-base uppercase tracking-widest border-b-2 border-red-200 pb-2 mb-2 text-center print-text-09rem print-mb-0">⚠️ {p.warn_title}</h3>
                
                <div className={"flex flex-col " + warnGap + " print-flex-1 print-justify-center"}>
                  {(rx.rxWarnings.length > 0 || rx.customWarnings.length > 0) ? (
                    <>
                      {rx.rxWarnings.map((wIdx: number) => (
                        <div key={wIdx} className={"flex items-center bg-white rounded-xl shadow-sm border border-red-100 print-box print-bg-white " + warnPadding}>
                          <span className={warnIconClass + " shrink-0 mr-3 print-icon print-mr-1-5"}>{th.warn_icons[wIdx]}</span>
                          <span className={"text-red-700 font-black leading-snug print-text-md " + warnTextSize}>{p.warn[wIdx]}</span>
                        </div>
                      ))}
                      {rx.customWarnings.map((cw: string, i: number) => (
                        <div key={i} className={"flex items-center bg-red-100 rounded-xl shadow-sm border border-red-300 print-box print-bg-red-50 " + warnPadding}>
                          <span className={warnIconClass + " shrink-0 mr-3 print-icon print-mr-1-5"}>🚨</span>
                          <span className={"text-red-800 font-black leading-snug print-text-md " + warnTextSize}>{cw}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-slate-300 opacity-60"><span className="text-5xl md:text-6xl mb-3 print-icon">✅</span><span className="font-black text-sm md:text-base print-text-08rem">No special warnings</span></div>
                  )}
                </div>
                
                {/* Allergy Alert */}
                <div className={"bg-red-600 text-white rounded-xl flex items-center gap-3 shadow-md border border-red-400 mt-3 print-box print-mt-auto print-bg-red " + (isWarnCrowded ? "p-3 print-p-1-5" : "p-4 print-p-2")}>
                   <span className={"shrink-0 print-icon print-text-white " + (isWarnCrowded ? "text-3xl md:text-4xl print-text-xl" : "text-4xl md:text-5xl print-text-2xl")}>🛑</span>
                   <span className={"font-black leading-snug print-text-white " + (isWarnCrowded ? "text-sm md:text-base print-text-065rem" : "text-base md:text-lg print-text-08rem")}>{p.allergy_alert}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    );
  };

  return (
    <div id="main-print-container" className="h-[100dvh] w-full bg-[#0f172a] font-sans flex flex-col overflow-hidden relative print-h-auto print-overflow-visible">
      
      {/* Patient View Area */}
      <div className={`w-full flex justify-center items-center transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] print-rotate-0 print-block print-bg-white ${isSharedLink ? 'rotate-0 ' : 'rotate-180 '} ${isFullscreen ? 'fixed inset-0 z-[100] bg-slate-900 h-full print-relative print-bg-white print-z-0' : 'bg-slate-100 ' + patientHeightClass}`}>
        
        {dispenseState === 'present' && !activeGuide ? (
          <div className="w-full h-full flex flex-col bg-slate-900 relative print-bg-white print-h-auto print-block print-w-full print-mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="absolute top-6 left-6 bg-blue-600 text-white font-black px-4 py-2 md:px-5 md:py-3 rounded-full shadow-xl border-2 border-blue-400 animate-pulse flex items-center gap-2 z-50 print-hidden pointer-events-auto">
               <span className="text-xl md:text-2xl">📸</span> <span className="text-[10px] md:text-sm">{p.photo_prompt}</span>
            </div>
            <div className="absolute top-6 right-6 flex items-center gap-2 z-50 pointer-events-none print-hidden">
              <button onClick={() => window.print()} className="bg-emerald-500 hover:bg-emerald-400 text-white w-10 h-10 md:w-12 md:h-12 rounded-full text-xl font-black shadow-xl flex items-center justify-center border-2 border-emerald-300 pointer-events-auto active:scale-95">🖨️</button>
              <button onClick={() => { setIsFullscreen(false); setDispenseState('input'); if(synthRef.current) synthRef.current.cancel(); setIsSpeaking(false); }} className="bg-red-500 hover:bg-red-400 text-white w-10 h-10 md:w-12 md:h-12 rounded-full text-xl md:text-2xl font-black shadow-xl flex items-center justify-center border-2 border-red-300 pointer-events-auto active:scale-95">✕</button>
            </div>
            {cart.length > 1 && (
              <div className="absolute bottom-6 right-6 bg-slate-800/80 text-white font-black text-xl md:text-2xl w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full border-2 border-slate-600 shadow-xl z-50 pointer-events-none print-hidden">
                {cart.length}
              </div>
            )}
            <div className="flex-1 w-full h-full relative print-h-auto print-overflow-visible">
               {cart.length > 1 && <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest animate-bounce z-50 pointer-events-none bg-slate-900/80 px-6 py-2 rounded-full border border-slate-700 print-hidden">{p.swipe_hint}</div>}
               <div id="horizontal-scroll-container" className="w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex hide-scrollbar scroll-smooth transform-gpu print-flex-col print-overflow-visible print-h-auto print-snap-none" style={{ WebkitOverflowScrolling: 'touch' }}>
                   {cart.length > 0 ? (
                     cart.map((rx, idx) => renderBoardingPass(rx, idx))
                   ) : (
                     renderBoardingPass({
                       drugInput, drugName, rxIndication, customIndication, isTapering: isTaperingMode, taperSteps,
                       rxDose, rxSide, rxFreq, rxTime, rxPeriod, rxWarnings, customWarnings,
                       cDose, cDoseUnit, cHour, cHourUnit, cApply, cApplyUnit, cDays, cDaysUnit
                     }, 0)
                   )}
               </div>
            </div>
          </div>
        ) : (
          <div dir={isRTL ? 'rtl' : 'ltr'} className={`relative transition-all duration-500 flex flex-col w-full h-full bg-white rounded-[2rem] shadow-xl overflow-hidden print-hidden ${activeQuestion || activeGuide ? 'opacity-100 p-4 md:p-6 pt-12 md:pt-10' : 'opacity-0'}`}>
            {activeGuide ? (
              <div className="w-full h-full flex flex-col relative">
                <div className="w-full shrink-0 flex items-center justify-end z-50 absolute top-0 right-0 pointer-events-none">
                  <button onClick={() => { setIsFullscreen(false); setDispenseState('input'); setActiveGuide(null); if(synthRef.current) synthRef.current.cancel(); setIsSpeaking(false); }} className="bg-red-500 hover:bg-red-400 text-white w-10 h-10 md:w-12 md:h-12 rounded-full text-xl font-black shadow-md flex items-center justify-center border border-red-300 pointer-events-auto">✕</button>
                </div>
                <div className="flex-1 w-full h-full flex items-center justify-center p-2 md:p-4">
                  {renderGuideCard(activeGuide)}
                </div>
              </div>
            ) : appMode === 'history' ? (
              <div className="text-center w-full flex flex-col h-full justify-center overflow-hidden pt-6 sm:pt-0">
                {activeQuestion === 'custom_msg' ? (
                  <div className="animate-in"><div className="text-6xl md:text-7xl mb-4 bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">💬</div><h2 className="text-2xl md:text-4xl font-black text-blue-600 mb-4 leading-snug">{translatedText}</h2></div>
                ) : (
                  <div>
                    {(!boolAnswer && ['q_dob', 'q_allergy', 'q_inj', 'q_med'].includes(activeQuestion as string)) && (
                      <div className="mb-4 text-blue-600 text-sm md:text-base font-bold bg-blue-50 px-6 py-2 rounded-full animate-pulse self-center border border-blue-100 inline-block">{p.tap_to_select}</div>
                    )}
                    {(!boolAnswer || !['q_allergy', 'q_inj', 'q_med'].includes(activeQuestion as string)) && (
                      <div className="animate-in relative">
                        <div className="text-5xl md:text-6xl mb-4 bg-slate-100 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
                          {activeQuestion === 'q_name' ? '👤' : activeQuestion === 'q_dob' ? '📅' : activeQuestion === 'q_allergy' ? '🚫' : activeQuestion === 'q_inj' ? '💉' : '💊'}
                        </div>
                        <div className="flex items-center justify-center gap-4 mb-4">
                           <h2 className="text-2xl md:text-4xl font-black text-slate-800">{activeQuestion ? p[activeQuestion] : ''}</h2>
                           {activeQuestion && (
                             <button onClick={toggleHistorySpeech} className={`w-12 h-12 rounded-full text-xl shadow-md flex items-center justify-center border ${isSpeaking ? "bg-blue-600 text-white border-blue-400 animate-pulse" : "bg-slate-100 text-slate-500 border-slate-300"}`}>
                               {isSpeaking ? '🛑' : '🔊'}
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
                    {['q_allergy', 'q_inj', 'q_med'].includes(activeQuestion as string) && (
                      <div className="w-full max-w-xl mx-auto mt-2">
                        {!boolAnswer ? (
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button onClick={() => setBoolAnswer('yes')} className="flex-1 py-4 md:py-6 rounded-[1.5rem] text-xl md:text-2xl font-black bg-red-50 text-red-600 border-2 border-red-200 shadow-sm active:scale-95">🚨 {p.yes}</button>
                            <button onClick={() => setBoolAnswer('no')} className="flex-1 py-4 md:py-6 rounded-[1.5rem] text-xl md:text-2xl font-black bg-green-50 text-green-600 border-2 border-green-200 shadow-sm active:scale-95">✅ {p.no}</button>
                            {activeQuestion === 'q_allergy' && (
                              <button onClick={() => setBoolAnswer('dont_know')} className="flex-1 py-4 md:py-6 rounded-[1.5rem] text-xl md:text-2xl font-black bg-yellow-50 text-yellow-700 border-2 border-yellow-300 shadow-sm active:scale-95">🤷‍♂️ {p.dont_know}</button>
                            )}
                          </div>
                        ) : boolAnswer === 'yes' ? (
                          (activeQuestion === 'q_allergy' || activeQuestion === 'q_med') ? (
                            <div className="bg-red-500 text-white rounded-[2rem] p-6 flex flex-col items-center"><div className="text-5xl md:text-6xl mb-4 bg-white/20 w-20 h-20 rounded-full flex items-center justify-center">📝</div><p className="text-lg md:text-2xl font-black text-center">{p.writePaper}</p></div>
                          ) : (
                            <div className="bg-blue-500 text-white rounded-[2rem] p-6 font-black text-3xl md:text-4xl text-center">✅ OK!</div>
                          )
                        ) : boolAnswer === 'no' ? ( 
                          <div className="bg-green-500 text-white rounded-[2rem] p-6 font-black text-3xl md:text-4xl text-center">✅ OK!</div>
                        ) : ( 
                          <div className="bg-yellow-500 text-white rounded-[2rem] p-6 font-black text-3xl md:text-4xl text-center">⚠️ OK</div> 
                        )}
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
        <div className="flex-1 bg-[#0f172a] rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative z-10 flex flex-col min-h-0 border-t border-slate-700/50 print-hidden">
          <div className="flex justify-between items-center p-4 md:p-6 pb-2 shrink-0">
            <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
              <button onClick={() => { setAppMode('history'); setDispenseState('input'); }} className={`px-3 py-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm font-black ${appMode === 'history' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>{th.tab_history}</button>
              <button onClick={() => { setAppMode('dispense'); setActiveQuestion(null); setDispenseState('input'); }} className={`px-3 py-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm font-black ${appMode === 'dispense' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>{th.tab_dispense}</button>
              <button onClick={() => { setAppMode('specialty'); setActiveQuestion(null); setDispenseState('input'); }} className={`px-3 py-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm font-black ${appMode === 'specialty' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}>{th.tab_special}</button>
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
              <button onClick={() => { setHasStarted(false); setActiveQuestion(null); resetFormOnly(); }} className="text-[10px] md:text-xs font-black text-white bg-slate-800 px-3 py-2 md:px-4 md:py-3 rounded-xl border border-slate-700 hover:bg-slate-700 flex items-center gap-1.5">
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
                      <span className="text-3xl animate-pulse">🗣️</span> ถาม: {th[activeQuestion as keyof typeof th]}
                      <button onClick={toggleHistorySpeech} className={`p-3 rounded-full text-xl shadow-md flex items-center justify-center border active:scale-95 ${isSpeaking ? "bg-indigo-600 text-white border-indigo-400 animate-pulse" : "bg-slate-800 text-slate-300 border-slate-600"}`}>
                        {isSpeaking ? '🛑' : '🔊'}
                      </button>
                    </div>
                    <button onClick={() => { setActiveQuestion(null); setBoolAnswer(null); }} className="bg-red-600 text-white font-black py-3 px-8 rounded-full text-base md:text-lg shadow-sm border border-red-400 mt-2 active:scale-95">
                      ❌ ปิดหน้าจอ
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 animate-in">
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {[{ id: 'q_name', icon: '👤', text: th.q_name, bg: 'bg-cyan-600' }, { id: 'q_dob', icon: '📅', text: th.q_dob, bg: 'bg-blue-600' }, { id: 'q_allergy', icon: '🚫', text: th.q_allergy, bg: 'bg-red-600' }].map(q => (
                        <button key={q.id} onClick={() => askQuestion(q.id)} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border min-h-[100px] shadow-sm active:scale-95 ${activeQuestion === q.id ? q.bg + ' border-transparent text-white ring-2 ring-white/20' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
                          <div className="text-3xl md:text-4xl">{q.icon}</div><span className="font-black text-xs md:text-sm text-center leading-tight">{q.text}</span>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      {[{ id: 'q_inj', icon: '💉', text: th.q_inj, bg: 'bg-purple-600' }, { id: 'q_med', icon: '💊', text: th.q_med, bg: 'bg-pink-600' }].map(q => (
                        <button key={q.id} onClick={() => askQuestion(q.id)} className={`flex items-center justify-center gap-3 p-4 rounded-xl border shadow-sm active:scale-95 ${activeQuestion === q.id ? q.bg + ' border-transparent text-white ring-2 ring-white/20' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
                          <div className="text-2xl md:text-3xl">{q.icon}</div><span className="font-black text-xs md:text-sm">{q.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {appMode === 'dispense' && dispenseState === 'input' && (
              <div className="flex flex-col gap-4 md:gap-5 pb-[120px] md:pb-[100px] animate-in relative z-0">
                <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 p-4 rounded-2xl border border-blue-800/50 flex flex-col gap-3 shadow-inner">
                  <div className="flex flex-col gap-2">
                    <span className="text-blue-300 text-[10px] md:text-xs font-black uppercase tracking-widest">💊 {th.drug_name}</span>
                    <div className="flex gap-2">
                      <input type="text" value={drugInput} onChange={(e) => setDrugInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && translateDrugName()} placeholder="พิมพ์ชื่อยา..." className="flex-1 bg-slate-900/80 border border-slate-700 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 font-bold text-[16px] md:text-lg" />
                      <button onClick={translateDrugName} disabled={!drugInput.trim() || isTranslatingDrug} className="bg-blue-600 text-white text-xs md:text-sm font-black px-4 py-2.5 rounded-xl disabled:opacity-50 active:scale-95">
                        {isTranslatingDrug ? '⏳' : 'ตกลง'}
                      </button>
                    </div>
                    {drugName && <span className="text-amber-400 text-[10px] md:text-xs font-black ml-1">✨ ชื่อแปลบนตั๋ว: {drugName}</span>}
                  </div>

                  <div className="flex flex-col gap-2 border-t border-blue-800/30 pt-3">
                    <span className="text-blue-300 text-[10px] md:text-xs font-black uppercase tracking-widest">🎯 {th.ind_title}</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {th.indication.map((ind: string, i: number) => (
                        <button key={i} onClick={() => { setRxIndication(rxIndication === i ? null : i); setCustomIndication(''); }} className={`px-2 py-2 rounded-lg text-[10px] md:text-xs font-black border flex items-center gap-1 active:scale-95 ${rxIndication === i ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
                          <span className="text-sm md:text-base">{th.ind_icons[i]}</span> <span className="line-clamp-1">{ind}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <input type="text" value={indInput} onChange={(e) => setIndInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && translateIndication()} placeholder="ระบุข้อบ่งใช้อื่นๆ..." className="flex-1 bg-slate-900/80 border border-slate-700 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-[16px] md:text-sm" />
                      <button onClick={translateIndication} disabled={!indInput.trim() || isTranslatingInd} className="bg-blue-600 text-white text-xs md:text-sm font-black px-4 py-2.5 rounded-xl disabled:opacity-50 active:scale-95">แปล</button>
                    </div>
                    {customIndication && <span className="text-emerald-400 text-[10px] md:text-xs font-black ml-1">✅ แปลแล้ว: {customIndication}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                   <span className="text-indigo-400 font-black text-xs md:text-sm px-2">📉 {th.taper_mode}</span>
                   <button onClick={() => setIsTaperingMode(!isTaperingMode)} className={`w-12 h-6 rounded-full p-1 transition-colors ${isTaperingMode ? 'bg-indigo-600' : 'bg-slate-600'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isTaperingMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </button>
                </div>

                {isTaperingMode ? (
                  <div className="bg-indigo-900/20 p-4 rounded-2xl border border-indigo-800/50 flex flex-col gap-3 shadow-inner">
                     <h3 className="text-indigo-400 text-xs md:text-sm font-black uppercase text-center">ระบบจัดการลดโดส / กินไม่เท่ากัน</h3>
                     {taperSteps.map((step, idx) => (
                       <div key={idx} className="bg-slate-900 p-3 md:p-4 rounded-xl border border-slate-700 flex flex-col gap-3">
                         <div className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-slate-400 font-black text-[10px] md:text-xs">Step {idx + 1}</span>
                            {taperSteps.length > 1 && <button onClick={() => setTaperSteps(taperSteps.filter((_, i) => i !== idx))} className="text-red-500 font-black text-[10px] md:text-xs">✕ ลบ</button>}
                         </div>
                         <div className="flex gap-2 md:gap-3">
                            <div className="flex-1 flex flex-col gap-1">
                               <span className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold">ระยะเวลา (วัน)</span>
                               <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-600">
                                 <button onClick={() => { const ns = [...taperSteps]; ns[idx].days = Math.max(1, ns[idx].days-1); setTaperSteps(ns);}} className="w-6 h-6 md:w-8 md:h-8 bg-slate-700 text-white rounded font-black active:scale-90">-</button>
                                 <input type="text" value={step.days} onChange={(e) => handleTaperDaysChange(idx, e.target.value)} className="flex-1 w-6 md:w-8 text-center font-black text-white bg-transparent outline-none text-[16px]" />
                                 <button onClick={() => { const ns = [...taperSteps]; ns[idx].days++; setTaperSteps(ns);}} className="w-6 h-6 md:w-8 md:h-8 bg-indigo-600 text-white rounded font-black active:scale-90">+</button>
                               </div>
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                               <span className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold">ปริมาณ (เม็ด)</span>
                               <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-600">
                                 <button onClick={() => { const ns = [...taperSteps]; ns[idx].dose = Math.max(0.5, Number(ns[idx].dose)-0.5); setTaperSteps(ns);}} className="w-6 h-6 md:w-8 md:h-8 bg-slate-700 text-white rounded font-black active:scale-90">-</button>
                                 <input type="text" value={step.dose} onChange={(e) => handleTaperDoseChange(idx, e.target.value)} className="flex-1 w-6 md:w-8 text-center font-black text-white bg-transparent outline-none text-[16px]" />
                                 <button onClick={() => { const ns = [...taperSteps]; ns[idx].dose = Number(ns[idx].dose) + 0.5; setTaperSteps(ns);}} className="w-6 h-6 md:w-8 md:h-8 bg-indigo-600 text-white rounded font-black active:scale-90">+</button>
                               </div>
                            </div>
                         </div>
                         <div className="flex flex-col gap-1.5 mt-1">
                            <span className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold">เวลาอาหาร</span>
                            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                              {th.time.map((tFood: string, tIdx: number) => (
                                <button key={tIdx} onClick={() => { const ns = [...taperSteps]; ns[idx].time = ns[idx].time === tIdx ? null : tIdx; setTaperSteps(ns); }} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black border active:scale-95 ${step.time === tIdx ? 'bg-teal-600 border-teal-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>🍽️ {tFood}</button>
                              ))}
                            </div>
                         </div>
                         <div className="flex flex-col gap-1.5 mt-0.5">
                            <span className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold">ช่วงเวลา</span>
                            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                              {th.period.map((pr: string, pIdx: number) => (
                                <button key={pIdx} onClick={() => { const ns = [...taperSteps]; if(ns[idx].periods.includes(pIdx)) ns[idx].periods = ns[idx].periods.filter(i => i !== pIdx); else ns[idx].periods.push(pIdx); ns[idx].periods.sort(); setTaperSteps(ns); }} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black border active:scale-95 ${step.periods.includes(pIdx) ? 'bg-orange-500 border-orange-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>{th.period_icons[pIdx]} {pr}</button>
                              ))}
                            </div>
                         </div>
                       </div>
                     ))} 
                     <button onClick={() => setTaperSteps([...taperSteps, { days: 3, dose: 1, unit: 'tab', time: null, periods: [0] }])} className="border border-dashed border-indigo-500/50 text-indigo-400 py-3 rounded-xl font-black text-xs md:text-sm hover:bg-indigo-900/30">➕ เพิ่มช่วงเวลาใหม่</button>
                  </div>
                ) : (
                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700 flex flex-col gap-3">
                    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar items-center">
                      <span className="text-slate-500 text-[10px] md:text-xs font-black uppercase w-12 shrink-0">ปริมาณ:</span>
                      {th.dose.map((item: string, i: number) => (
                        <button key={i} onClick={() => { setRxDose(rxDose === i ? null : i); setCDose(0); }} className={`whitespace-nowrap px-3 py-2 rounded-lg text-[10px] md:text-xs font-black border active:scale-95 ${rxDose === i ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}`}>
                          {i === 0 ? '🌗' : i > 4 ? (i > 6 ? '💧' : '💨') : '💊'} {item}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar items-center">
                      <span className="text-slate-500 text-[10px] md:text-xs font-black uppercase w-12 shrink-0">ความถี่:</span>
                      {th.freq.map((item: string, i: number) => (
                        <button key={i} onClick={() => { setRxFreq(rxFreq === i ? null : i); setCHour(0); setCApply(0); }} className={`whitespace-nowrap px-3 py-2 rounded-lg text-[10px] md:text-xs font-black border active:scale-95 ${rxFreq === i ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}`}>
                          🔄 {item}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar items-center">
                      <span className="text-slate-500 text-[10px] md:text-xs font-black uppercase w-12 shrink-0">อาหาร:</span>
                      {th.time.map((item: string, i: number) => (
                        <button key={i} onClick={() => setRxTime(rxTime === i ? null : i)} className={`whitespace-nowrap px-3 py-2 rounded-lg text-[10px] md:text-xs font-black border active:scale-95 ${rxTime === i ? 'bg-teal-600 border-teal-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}`}>
                          🍽️ {item}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar items-center">
                      <span className="text-slate-500 text-[10px] md:text-xs font-black uppercase w-12 shrink-0">เวลา:</span>
                      {th.period.map((pTime: string, i: number) => (
                        <button key={i} onClick={() => togglePeriod(i)} className={`whitespace-nowrap px-3 py-2 rounded-lg text-[10px] md:text-xs font-black border active:scale-95 ${rxPeriod.includes(i) ? 'bg-orange-500 border-orange-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}`}>
                          {th.period_icons[i]} {pTime}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar items-center">
                      <span className="text-slate-500 text-[10px] md:text-xs font-black uppercase w-12 shrink-0">ข้าง:</span>
                      {th.side.map((item: string, i: number) => (
                        <button key={i} onClick={() => setRxSide(rxSide === i ? null : i)} className={`whitespace-nowrap px-3 py-2 rounded-lg text-[10px] md:text-xs font-black border active:scale-95 ${rxSide === i ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}`}>
                          {th.side_icons[i]} {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!isTaperingMode && (
                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700 shadow-inner flex flex-col items-center">
                    <button onClick={() => setIsSmartOpen(!isSmartOpen)} className="w-full flex items-center justify-between text-slate-300 font-black uppercase text-[10px] md:text-xs outline-none">
                      <span className="flex items-center gap-2">🔢 ระบบระบุตัวเลข</span>
                      <span className="text-xl bg-slate-700/50 w-8 h-8 rounded-full flex items-center justify-center border border-slate-600">{isSmartOpen ? '➖' : '➕'}</span>
                    </button>
                    {isSmartOpen && (
                      <div className="grid grid-cols-2 gap-3 w-full mt-4 animate-in fade-in">
                        {[
                          { label: 'ใช้ครั้งละ', val: cDose, setVal: setCDose, unit: cDoseUnit, setUnit: setCDoseUnit, step: 0.5, uOptions: ['tab', 'cap', 'tsp', 'tbsp', 'ml', 'cc', 'puff', 'drop'], icon: '💊', reset: () => setRxDose(null) },
                          { label: 'ทุกๆ', val: cHour, setVal: setCHour, unit: cHourUnit, setUnit: setCHourUnit, step: 1, uOptions: ['hr'], icon: '⏳', reset: () => setRxFreq(null) },
                          { label: 'ทาวันละ', val: cApply, setVal: setCApply, unit: cApplyUnit, setUnit: setCApplyUnit, step: 1, uOptions: ['times'], icon: '🧴', reset: () => setRxFreq(null) },
                          { label: 'ติดต่อกัน', val: cDays, setVal: setCDays, unit: cDaysUnit, setUnit: setCDaysUnit, step: 1, uOptions: ['day', 'wk'], icon: '🗓️', reset: () => {} }
                        ].map((input, idx) => (
                          <div key={idx} className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center gap-2">
                            <span className="text-slate-300 text-[10px] md:text-xs font-black flex items-center gap-1">{input.icon} {input.label}</span>
                            <div className="flex flex-col xl:flex-row items-center gap-2 w-full">
                              <div className="flex items-center bg-slate-800 rounded-lg p-1 w-full justify-between">
                                <button onClick={() => input.setVal(Math.max(0, Number(input.val) - input.step))} className="w-8 h-8 rounded bg-slate-700 text-white font-black text-lg active:scale-90">-</button>
                                <input type="text" value={input.val} onChange={(e) => handleNumberInput(input.setVal, e.target.value)} className="font-black text-xl text-cyan-400 w-10 text-center bg-transparent outline-none text-[16px]" />
                                <button onClick={() => { input.setVal(Number(input.val) + input.step); input.reset(); }} className="w-8 h-8 rounded bg-cyan-700 text-white font-black text-lg active:scale-90">+</button>
                              </div>
                              <select value={input.unit} onChange={(e) => input.setUnit(e.target.value)} className="bg-slate-800 text-slate-300 border border-slate-600 text-[16px] font-bold rounded-lg w-full xl:w-auto py-2 px-2 outline-none">
                                {input.uOptions.map(u => <option key={u} value={u}>{unitDict[u].th}</option>)}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-red-900/10 p-4 rounded-2xl border border-red-900/30 flex flex-col gap-4 shadow-inner">
                  <span className="text-red-400 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2">⚠️ คำเตือน (Warnings)</span>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {th.warn.map((w: string, i: number) => (
                      <button key={i} onClick={() => toggleWarning(i)} className={`px-2 py-3 rounded-xl text-[9px] md:text-[10px] font-black border flex items-center gap-2 active:scale-95 ${rxWarnings.includes(i) ? 'bg-red-500 border-red-400 text-white shadow-sm' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                        <span className="text-lg shrink-0">{th.warn_icons[i]}</span><span className="text-left line-clamp-2">{w}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 border-t border-red-900/30 pt-3">
                    <input type="text" value={warnInput} onChange={(e) => setWarnInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && translateWarning()} placeholder="พิมพ์คำเตือนพิเศษ..." className="flex-1 bg-slate-900/80 border border-slate-700 text-white rounded-xl px-4 py-2.5 outline-none focus:border-red-500 font-bold text-[16px] md:text-sm" />
                    <button onClick={translateWarning} disabled={!warnInput.trim() || isTranslatingWarn} className="bg-red-600 text-white text-xs md:text-sm font-black px-4 py-2.5 rounded-xl disabled:opacity-50 active:scale-95">เพิ่ม</button>
                  </div>
                  {customWarnings.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {customWarnings.map((cw, i) => (
                        <div key={i} className="bg-red-500/20 text-red-200 border border-red-500/50 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                          🚨 {cw} <button onClick={() => removeCustomWarning(i)} className="text-red-400 font-black text-lg hover:text-red-300">&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

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
            <div className="absolute bottom-0 left-0 w-full p-3 md:p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 flex flex-col md:flex-row items-center gap-3 z-50">
              <button onClick={addToCart} disabled={!drugInput && rxIndication === null} className="w-full md:w-auto bg-slate-800 border border-slate-600 text-white font-black px-6 py-3 md:py-4 rounded-xl disabled:opacity-30 text-xs md:text-sm active:scale-95">
                {th.add_to_cart}
              </button>
              <button onClick={showBoardingPass} disabled={cart.length === 0 && !drugInput} className="flex-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm md:text-base py-3 md:py-4 rounded-xl shadow-md disabled:opacity-30 border border-indigo-400/50 active:scale-95">
                🚀 โชว์การ์ดทั้งหมด {cart.length > 0 ? `(${cart.length} ${th.items})` : ''}
              </button>
            </div>
          )}

          {appMode === 'history' && !activeQuestion && (
            <div className="p-4 md:p-6 border-t border-slate-800 shrink-0 pb-safe bg-[#0f172a] relative z-50">
              <div className="flex gap-3 items-center">
                <input type="text" value={customText} onChange={(e) => setCustomText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleTranslate()} placeholder="พิมพ์สื่อสารทั่วไป..." className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none font-bold text-[16px] md:text-sm" />
                <button onClick={handleTranslate} disabled={!customText.trim() || isTranslating} className="bg-cyan-600 text-white font-black px-6 py-3 rounded-xl disabled:opacity-50 text-xs md:text-sm border border-cyan-400/50 active:scale-95">
                  ส่ง 💬
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🎯 Popup Modal สำหรับส่งลิ้งก์ให้เภสัช 🎯 */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] print-hidden">
          <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col items-center max-w-sm w-[90%] shadow-[0_0_50px_rgba(79,70,229,0.5)] animate-in rotate-0">
             <div className="text-5xl mb-4">💻</div>
             <h3 className="text-slate-800 font-black text-lg md:text-xl text-center mb-2">พิมพ์ลิ้งก์ที่คอมเพื่อปริ้นท์</h3>
             <div className="bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-black text-3xl md:text-4xl py-4 px-8 rounded-2xl my-4 w-full text-center tracking-widest">{shortLink || '⏳'}</div>
             <button onClick={() => setShowLinkModal(false)} className="bg-slate-800 text-white font-black px-8 py-3 rounded-full active:scale-95 w-full">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* Print CSS - Structure and Layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@700;900&display=swap'); 
        .font-arabic { font-family: 'Noto Sans Arabic', sans-serif !important; } 
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 24px); } 
        .animate-in { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; } 
        .fade-in { animation: fadeIn 0.3s ease-in-out forwards; } 
        @keyframes popIn { from { opacity: 0; transform: translateY(15px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } } 
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } 
        .hide-scrollbar::-webkit-scrollbar { display: none; } 
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } 
        .custom-scrollbar::-webkit-scrollbar { width: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        select { -webkit-appearance: none; -moz-appearance: none; appearance: none; background-image: url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>"); background-repeat: no-repeat; background-position-x: 95%; background-position-y: 50%; }
        
        @media print {
          @page { size: A5 landscape; margin: 0; }
          body, html { width: 100vw !important; height: 100vh !important; margin: 0 !important; padding: 0 !important; background: white !important; color: black !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-size: 14px !important; }
          
          .print-bg-white { background-color: white !important; background: white !important; }
          .print-bg-transparent { background-color: transparent !important; background: transparent !important; }
          .print-h-auto { height: auto !important; }
          .print-overflow-visible { overflow: visible !important; }
          .print-block { display: block !important; }
          .print-relative { position: relative !important; }
          .print-z-0 { z-index: 0 !important; }
          .print-rotate-0 { transform: rotate(0deg) !important; }

          .print-hidden { display: none !important; }
          .print-rx-layout { display: flex !important; flex-direction: row !important; justify-content: center !important; align-items: stretch !important; gap: 4% !important; width: 100vw !important; height: 100vh !important; overflow: hidden !important; page-break-inside: avoid !important; page-break-after: always !important; padding: 5mm !important; box-sizing: border-box !important; }
          .print-card-wrapper { width: 48% !important; height: 100% !important; padding: 0 !important; }
          .print-rx-card { border: 2px solid #ccc !important; height: 100% !important; border-radius: 10px !important; display: flex !important; flex-direction: column !important; }
          .print-bg-blue { background: #1e3a8a !important; border-bottom: 2px solid #1e3a8a !important; border-radius: 8px 8px 0 0 !important; }
          .print-bg-red { background: #7f1d1d !important; border-bottom: 2px solid #7f1d1d !important; border-radius: 8px 8px 0 0 !important; }
          .print-text-white { color: white !important; }
          .print-no-scale { transform: none !important; }
          .print-text-wrap { white-space: normal !important; word-wrap: break-word !important; display: inline-block !important; width: 100% !important; text-align: center !important; }
          .print-box { padding: 1.5mm !important; border-radius: 6px !important; border: 1.5px solid #e2e8f0 !important; margin-bottom: 1.5mm !important; }
          .print-header { padding: 2.5mm !important; }
        }
      `}} />
    </div>
  );
}
