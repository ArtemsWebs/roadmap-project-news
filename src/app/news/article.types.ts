/**
 * Типы ответа Event Registry `article/getArticle`.
 * Полностью повторяют присланную JSON-схему ответа.
 *
 * Ответ метода — объект, ключ которого = URI статьи:
 *   { "<articleUri>": { info, duplicatedArticles?, originalArticle? } }
 */

/** Мультиязычная подпись (label.eng и т.п.) */
export interface LangLabel {
  eng?: string;
  [lang: string]: string | undefined;
}

/** Гео-метка (source.location / article.location / concept.location) */
export interface GeoLocation {
  type?: string;
  label?: LangLabel;
}

/** Источник статьи (расширенный, как в getArticle) */
export interface ArticleSourceInfo {
  uri: string;
  dataType: string;
  title: string;
  description?: string;
  location?: GeoLocation;
  locationValidated?: boolean;
  ranking?: {
    importanceRank?: number;
  };
}

/** Трендовость концепта */
export interface ConceptTrendingScore {
  news?: {
    score: number;
    testPopFq: number;
    nullPopFq: number;
  };
}

/** Концепт (сущность): человек, организация, место, тема */
export interface ArticleConcept {
  uri: string;
  type: string;
  score: number;
  label: LangLabel;
  image?: string;
  synonyms?: Record<string, unknown>;
  trendingScore?: ConceptTrendingScore;
  location?: GeoLocation;
}

/** Категория статьи */
export interface ArticleCategory {
  uri: string;
  label: string;
  wgt: number;
}

/** Извлечённая из текста дата */
export interface ExtractedDate {
  amb: boolean;
  imp: boolean;
  date: string;
  textStart: number;
  textEnd: number;
}

/** Счётчики шеринга */
export interface ArticleShares {
  facebook?: number;
}

/**
 * Полная информация о статье (`info` / элементы duplicatedArticles.results /
 * originalArticle). Все поля повторяют схему getArticle.
 */
export interface ArticleInfo {
  uri: string;
  lang: string;
  isDuplicate: boolean;
  date: string;
  time: string;
  dateTime: string;
  sim: number;
  url: string;
  title: string;
  body: string;
  source: ArticleSourceInfo;
  concepts?: ArticleConcept[];
  categories?: ArticleCategory[];
  links?: string[];
  videos?: string[];
  image?: string;
  duplicateList?: string[];
  /** В info это строка-URI оригинала */
  originalArticle?: string;
  eventUri?: string;
  location?: GeoLocation;
  extractedDates?: ExtractedDate[];
  shares?: ArticleShares;
  wgt: number;
}

/** Список дубликатов статьи (пагинированный) */
export interface DuplicatedArticles {
  totalResults: number;
  page: number;
  count: number;
  pages: number;
  results: ArticleInfo[];
}

/** Значение по ключу-URI в ответе getArticle */
export interface ArticleResult {
  info: ArticleInfo;
  duplicatedArticles?: DuplicatedArticles;
  /** На верхнем уровне originalArticle — полноценный объект статьи */
  originalArticle?: ArticleInfo;
}

/** Успешный ответ getArticle: словарь по URI статьи */
export type GetArticleResponse = Record<string, ArticleResult>;

/** Ответ при ошибке */
export interface GetArticleErrorResponse {
  error: string;
}

export type GetArticleApiResponse =
  | GetArticleResponse
  | GetArticleErrorResponse;

export function isGetArticleError(
  res: GetArticleApiResponse,
): res is GetArticleErrorResponse {
  return res != null && typeof res === 'object' && 'error' in res;
}
