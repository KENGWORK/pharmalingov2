import type { Prescription, Lang } from './dict';

// Add the value to the list, or remove it if it's already there.
export const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter(v => v !== value) : [...list, value];

// Typing guards for numeric text fields ('' allowed so the field can be cleared).
export const isDecimal = (v: string) => /^\d*\.?\d*$/.test(v);
export const isInteger = (v: string) => /^\d*$/.test(v);

const GT_LANG: Record<string, string> = { th: 'th', en: 'en', de: 'de', fr: 'fr', zh: 'zh-CN', ja: 'ja', ru: 'ru', ar: 'ar' };

// Thai -> patient language via the unofficial Google endpoint. Joins every returned
// segment (multi-sentence input comes back split) and gives up after 6s instead of hanging.
export const translateFromThai = async (text: string, lang: string): Promise<string> => {
  const res = await fetch(
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=th&tl=' + GT_LANG[lang] + '&dt=t&q=' + encodeURIComponent(text),
    { signal: AbortSignal.timeout(6000) }
  );
  const data = await res.json();
  return (data[0] as [string][]).map(seg => seg[0]).join('');
};

// Short link for typing on a computer. is.gd first, then v.gd (same service, other domain); null if both fail.
export const shortenUrl = async (longUrl: string): Promise<string | null> => {
  for (const host of ['https://is.gd', 'https://v.gd']) {
    try {
      const res = await fetch(`${host}/create.php?format=json&url=${encodeURIComponent(longUrl)}`, { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      if (data.shorturl) return String(data.shorturl).replace('https://', '');
    } catch {
      // try the next shortener
    }
  }
  return null;
};

// Shared print link: the whole cart + language goes into ?rx= as base64 JSON.
export type SharePayload = { cart: Prescription[]; lang?: Lang };

// base64url (- and _ instead of + and /, no padding): plain base64 breaks in a query string, because
// a '+' is read back as a space and the link no longer decodes.
export const encodeShare = (data: SharePayload) =>
  btoa(unescape(encodeURIComponent(JSON.stringify(data)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const decodeShare = (str: string): SharePayload | null => {
  try {
    // ' ' -> '+' repairs links made before base64url, whose '+' arrived as a space
    const base64 = str.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch {
    return null;
  }
};
