// ==========================================
// Curated Multilingual Drug Name Database
// ==========================================
// Verified drug-name translations for common OPD medications.
// Used to AVOID unverified machine translation of drug names (patient-safety critical).
// `aliases` are matched case-insensitively against pharmacist input (Thai / English / brand).

export type DrugLang = 'en' | 'de' | 'fr' | 'zh' | 'ja' | 'ru' | 'ar';

export type DrugEntry = {
  aliases: string[];
  names: Record<DrugLang, string>;
};

export const drugData: DrugEntry[] = [
  {
    aliases: ['paracetamol', 'acetaminophen', 'พารา', 'พาราเซตามอล', 'tylenol', 'sara', 'ซารา'],
    names: { en: 'Paracetamol', de: 'Paracetamol', fr: 'Paracétamol', zh: '对乙酰氨基酚', ja: 'アセトアミノフェン', ru: 'Парацетамол', ar: 'باراسيتامول' }
  },
  {
    aliases: ['ibuprofen', 'ไอบูโพรเฟน', 'brufen', 'nurofen'],
    names: { en: 'Ibuprofen', de: 'Ibuprofen', fr: 'Ibuprofène', zh: '布洛芬', ja: 'イブプロフェン', ru: 'Ибупрофен', ar: 'إيبوبروفين' }
  },
  {
    aliases: ['amoxicillin', 'อะม็อกซีซิลลิน', 'amoxy', 'อะม็อกซิ'],
    names: { en: 'Amoxicillin', de: 'Amoxicillin', fr: 'Amoxicilline', zh: '阿莫西林', ja: 'アモキシシリン', ru: 'Амоксициллин', ar: 'أموكسيسيلين' }
  },
  {
    aliases: ['azithromycin', 'อะซิโทรมัยซิน', 'zithromax'],
    names: { en: 'Azithromycin', de: 'Azithromycin', fr: 'Azithromycine', zh: '阿奇霉素', ja: 'アジスロマイシン', ru: 'Азитромицин', ar: 'أزيثروميسين' }
  },
  {
    aliases: ['cetirizine', 'เซทิริซีน', 'zyrtec'],
    names: { en: 'Cetirizine', de: 'Cetirizin', fr: 'Cétirizine', zh: '西替利嗪', ja: 'セチリジン', ru: 'Цетиризин', ar: 'سيتيريزين' }
  },
  {
    aliases: ['loratadine', 'ลอราทาดีน', 'claritin', 'clarityne'],
    names: { en: 'Loratadine', de: 'Loratadin', fr: 'Loratadine', zh: '氯雷他定', ja: 'ロラタジン', ru: 'Лоратадин', ar: 'لوراتادين' }
  },
  {
    aliases: ['chlorpheniramine', 'cpm', 'คลอเฟนิรามีน', 'คลอร์เฟนิรามีน'],
    names: { en: 'Chlorpheniramine', de: 'Chlorphenamin', fr: 'Chlorphénamine', zh: '氯苯那敏', ja: 'クロルフェニラミン', ru: 'Хлорфенамин', ar: 'كلورفينامين' }
  },
  {
    aliases: ['dextromethorphan', 'เดกซ์โทรเมทอร์แฟน', 'ยาแก้ไอ'],
    names: { en: 'Dextromethorphan', de: 'Dextromethorphan', fr: 'Dextrométhorphane', zh: '右美沙芬', ja: 'デキストロメトルファン', ru: 'Декстрометорфан', ar: 'ديكستروميثورفان' }
  },
  {
    aliases: ['omeprazole', 'โอเมพราโซล', 'losec'],
    names: { en: 'Omeprazole', de: 'Omeprazol', fr: 'Oméprazole', zh: '奥美拉唑', ja: 'オメプラゾール', ru: 'Омепразол', ar: 'أوميبرازول' }
  },
  {
    aliases: ['domperidone', 'ดอมเพอริโดน', 'motilium'],
    names: { en: 'Domperidone', de: 'Domperidon', fr: 'Dompéridone', zh: '多潘立酮', ja: 'ドンペリドン', ru: 'Домперидон', ar: 'دومبيريدون' }
  },
  {
    aliases: ['hyoscine', 'buscopan', 'ไฮออสซีน', 'บุสโคพาน'],
    names: { en: 'Hyoscine butylbromide (Buscopan)', de: 'Butylscopolamin (Buscopan)', fr: 'Butylscopolamine (Buscopan)', zh: '丁溴东莨菪碱', ja: 'ブチルスコポラミン', ru: 'Гиосцина бутилбромид', ar: 'هيوسين بيوتيل برومايد' }
  },
  {
    aliases: ['ors', 'oral rehydration salts', 'เกลือแร่', 'ผงเกลือแร่'],
    names: { en: 'Oral Rehydration Salts (ORS)', de: 'Orale Rehydratationssalze (ORS)', fr: 'Sels de réhydratation orale (SRO)', zh: '口服补液盐', ja: '経口補水塩', ru: 'Соли для пероральной регидратации', ar: 'أملاح الإماهة الفموية' }
  },
  {
    aliases: ['amlodipine', 'แอมโลดิพีน', 'norvasc'],
    names: { en: 'Amlodipine', de: 'Amlodipin', fr: 'Amlodipine', zh: '氨氯地平', ja: 'アムロジピン', ru: 'Амлодипин', ar: 'أملوديبين' }
  },
  {
    aliases: ['metformin', 'เมทฟอร์มิน', 'glucophage'],
    names: { en: 'Metformin', de: 'Metformin', fr: 'Metformine', zh: '二甲双胍', ja: 'メトホルミン', ru: 'Метформин', ar: 'ميتفورمين' }
  },
  {
    aliases: ['simvastatin', 'ซิมวาสแตติน', 'zocor'],
    names: { en: 'Simvastatin', de: 'Simvastatin', fr: 'Simvastatine', zh: '辛伐他汀', ja: 'シンバスタチン', ru: 'Симвастатин', ar: 'سيمفاستاتين' }
  },
  {
    aliases: ['aspirin', 'แอสไพริน', 'asa', 'aspent'],
    names: { en: 'Aspirin', de: 'Aspirin', fr: 'Aspirine', zh: '阿司匹林', ja: 'アスピリン', ru: 'Аспирин', ar: 'أسبرين' }
  },
  {
    aliases: ['tramadol', 'ทรามาดอล', 'tramal'],
    names: { en: 'Tramadol', de: 'Tramadol', fr: 'Tramadol', zh: '曲马多', ja: 'トラマドール', ru: 'Трамадол', ar: 'ترامادول' }
  },
  {
    aliases: ['salbutamol', 'albuterol', 'ซัลบูทามอล', 'ventolin'],
    names: { en: 'Salbutamol', de: 'Salbutamol', fr: 'Salbutamol', zh: '沙丁胺醇', ja: 'サルブタモール', ru: 'Сальбутамол', ar: 'سالبوتامول' }
  }
];

// Returns verified drug entry for the input, or null if not in curated DB.
export const findDrug = (input: string): DrugEntry | null => {
  const q = input.trim().toLowerCase();
  if (q.length < 2) return null;
  // 1. Exact alias match
  const exact = drugData.find(d => d.aliases.some(a => a.toLowerCase() === q));
  if (exact) return exact;
  // 2. Prefix match (query is the start of an alias), only for queries >= 3 chars
  if (q.length >= 3) {
    const prefix = drugData.find(d => d.aliases.some(a => a.toLowerCase().startsWith(q)));
    if (prefix) return prefix;
  }
  return null;
};

// Curated name of the drug in the patient's language, or null if the input isn't in the curated DB.
export const verifiedName = (input: string, lang: string): string | null => {
  const match = findDrug(input);
  return match ? match.names[lang as DrugLang] || match.names.en : null;
};
