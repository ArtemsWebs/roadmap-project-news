import type { Article } from '../news/types';
import type { ArticleInfo } from '../news/article.types';

/** Кол-во минут чтения (~200 слов/мин), минимум 1 */
export const readingTime = (body: string): number => {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

/**
 * TRUST_SCORE 0..99 из importanceRank источника (меньше rank → выше доверие).
 * Если ранга нет — нейтральные 50.
 */
export const trustScore = (importanceRank?: number): number => {
  if (!importanceRank || importanceRank <= 0) return 50;
  return Math.max(1, Math.min(99, Math.round(100 - Math.log10(importanceRank) * 11)));
};

/** Детерминированный hash строки (djb2) */
const hash = (s: string): number => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h);
};

/** Псевдо-распределение настроения (HYPE/FEAR/DOUBT), стабильное для статьи */
export const deriveMood = (
  seed: string,
): { hype: number; fear: number; doubt: number } => {
  const h = hash(seed);
  const hype = 40 + (h % 41); // 40..80
  const fear = 10 + ((h >> 3) % 31); // 10..40
  const raw = 100 - hype - fear;
  const doubt = Math.max(5, raw);
  const total = hype + fear + doubt;
  return {
    hype: Math.round((hype / total) * 100),
    fear: Math.round((fear / total) * 100),
    doubt: Math.round((doubt / total) * 100),
  };
};

/** Краткая выжимка: первые N предложений тела */
export const tldrBullets = (body: string, count = 3): string[] => {
  const sentences = body
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);
  return sentences.slice(0, count);
};

/** Разбивка тела на абзацы */
export const toParagraphs = (body: string): string[] =>
  body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

/** Короткая подпись категории: "dmoz/Science/Tech" → "TECH" */
export const shortCategory = (label?: string): string | null => {
  if (!label) return null;
  const last = label.split('/').pop() ?? label;
  return last.toUpperCase();
};

/** Адаптер ArticleInfo (getArticle) → Article (карточка ленты) */
export const infoToArticle = (a: ArticleInfo): Article => ({
  uri: a.uri,
  lang: a.lang,
  isDuplicate: a.isDuplicate,
  date: a.date,
  time: a.time,
  dateTime: a.dateTime,
  dateTimePub: a.dateTime,
  dataType: a.source?.dataType ?? 'news',
  sim: a.sim,
  url: a.url,
  title: a.title,
  body: a.body,
  source: {
    uri: a.source?.uri ?? 'unknown',
    dataType: a.source?.dataType ?? 'news',
    title: a.source?.title ?? 'UNKNOWN',
  },
  authors: [],
  image: a.image ?? null,
  eventUri: a.eventUri ?? null,
  sentiment: null,
  wgt: a.wgt,
  relevance: 0,
});
