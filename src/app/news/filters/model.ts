import { GeoLocation } from '@/app/component/location/api';
import { create } from 'zustand';

/**
 * Модель фильтров, отражающая РЕАЛЬНЫЕ параметры запроса Event Registry
 * (article/getArticles, та же семья параметров, что и getArticlesForTopicPage).
 * @see https://newsapi.ai/documentation?tab=searchArticlesForTopic
 */

/** Где искать ключевое слово — реальный параметр `keywordLoc` */
export type KeywordLoc = 'title' | 'body' | 'title-body';

/** Логический оператор между ключевыми словами — реальный `keywordOper` */
export type KeywordOper = 'and' | 'or';

/** Тип материала — реальный `dataType` */
export type DataType = 'news' | 'pr' | 'blog';

/**
 * Сортировка — реальный `articlesSortBy`.
 * В UI показываем «дружелюбные» подписи (PUBLISHED_AT / RELEVANCY / POPULARITY).
 */
export type SortBy = 'date' | 'rel' | 'socialScore';

export interface NewsFilters {
  /** keyword — поисковый запрос */
  keyword: string;
  /** ignoreKeyword — исключающий запрос */
  ignoreKeyword: string;
  /** keywordLoc — где искать */
  keywordLoc: KeywordLoc;
  /** keywordOper — оператор */
  keywordOper: KeywordOper;
  /** sourceUri — источники (домены), через запятую */
  sourceUri: string;
  /** ignoreSourceUri — исключённые источники, через запятую */
  ignoreSourceUri: string;
  /** lang — языки (ISO 639-3) */
  lang: string[];
  /** dateStart — YYYY-MM-DD */
  dateStart: string;
  /** dateEnd — YYYY-MM-DD */
  dateEnd: string;
  /** dataType — типы материалов */
  dataType: DataType[];
  /** articlesSortBy */
  sortBy: SortBy;
  /** isDuplicateFilter=skipDuplicates — убирать дубликаты */
  skipDuplicates: boolean;
  /** articlesCount — размер страницы (1..100) */
  pageSize: number;
  /** articlesPage — номер страницы (с 1) */
  page: number;
}

export const DEFAULT_FILTERS: NewsFilters = {
  keyword: '',
  ignoreKeyword: '',
  keywordLoc: 'body',
  keywordOper: 'and',
  sourceUri: '',
  ignoreSourceUri: '',
  lang: ['eng'],
  dateStart: '',
  dateEnd: '',
  dataType: ['news'],
  sortBy: 'date',
  skipDuplicates: true,
  pageSize: 30,
  page: 1,
};

/** Языки: подпись для UI (ISO-639-1-стиль) → реальный код Event Registry (ISO-639-3) */
export const LANGUAGES: { label: string; code: string }[] = [
  { label: 'AR', code: 'ara' },
  { label: 'DE', code: 'deu' },
  { label: 'EN', code: 'eng' },
  { label: 'ES', code: 'spa' },
  { label: 'FR', code: 'fra' },
  { label: 'HE', code: 'heb' },
  { label: 'IT', code: 'ita' },
  { label: 'NL', code: 'nld' },
  { label: 'NO', code: 'nor' },
  { label: 'PT', code: 'por' },
  { label: 'RU', code: 'rus' },
  { label: 'SV', code: 'swe' },
  { label: 'UR', code: 'urd' },
  { label: 'ZH', code: 'zho' },
];

export const KEYWORD_LOC_OPTIONS: { label: string; value: KeywordLoc }[] = [
  { label: 'title', value: 'title' },
  { label: 'body', value: 'body' },
  { label: 'title+body', value: 'title-body' },
];

export const DATA_TYPE_OPTIONS: { label: string; value: DataType }[] = [
  { label: 'news', value: 'news' },
  { label: 'pr', value: 'pr' },
  { label: 'blog', value: 'blog' },
];

export const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: 'PUBLISHED_AT', value: 'date' },
  { label: 'RELEVANCY', value: 'rel' },
  { label: 'POPULARITY', value: 'socialScore' },
];

/** Человекочитаемая подпись для значения сортировки (для быстрых фильтров) */
export const sortLabel = (value: SortBy): string =>
  SORT_OPTIONS.find((o) => o.value === value)?.label.toLowerCase() ?? value;

/** Подпись языка по коду ISO-639-3 */
export const langLabel = (code: string): string =>
  LANGUAGES.find((l) => l.code === code)?.label ?? code.toUpperCase();

/* ====================== ACTIVE CHIPS ====================== */

export interface ActiveChip {
  key: FilterKey;
  label: string;
}

const truncate = (s: string, n = 22) =>
  s.length > n ? s.slice(0, n) + '…' : s;

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v) => b.includes(v));

/** Список активных (отличных от дефолта) фильтров — для чипсов и бейджа */
export const deriveActiveChips = (
  f: NewsFilters,
  location: GeoLocation | null,
): ActiveChip[] => {
  if (!location) return [];

  const chips: ActiveChip[] = [];

  if (f.keyword.trim())
    chips.push({ key: 'keyword', label: `Q: ${truncate(f.keyword)}` });
  if (f.ignoreKeyword.trim())
    chips.push({
      key: 'ignoreKeyword',
      label: `-KW: ${truncate(f.ignoreKeyword)}`,
    });
  if (f.keywordLoc !== DEFAULT_FILTERS.keywordLoc)
    chips.push({ key: 'keywordLoc', label: `IN: ${f.keywordLoc}` });
  if (f.sourceUri.trim())
    chips.push({ key: 'sourceUri', label: `SRC: ${truncate(f.sourceUri)}` });
  if (f.ignoreSourceUri.trim())
    chips.push({
      key: 'ignoreSourceUri',
      label: `-SRC: ${truncate(f.ignoreSourceUri)}`,
    });
  if (f.dateStart)
    chips.push({ key: 'dateStart', label: `FROM: ${f.dateStart}` });
  if (f.dateEnd) chips.push({ key: 'dateEnd', label: `TO: ${f.dateEnd}` });
  if (!arraysEqual(f.lang, DEFAULT_FILTERS.lang))
    chips.push({
      key: 'lang',
      label: `LANG: ${f.lang.map(langLabel).join(',') || '—'}`,
    });
  if (!arraysEqual(f.dataType, DEFAULT_FILTERS.dataType))
    chips.push({
      key: 'dataType',
      label: `TYPE: ${f.dataType.join(',') || '—'}`,
    });
  if (f.sortBy !== DEFAULT_FILTERS.sortBy)
    chips.push({ key: 'sortBy', label: `SORT: ${sortLabel(f.sortBy)}` });
  if (f.skipDuplicates !== DEFAULT_FILTERS.skipDuplicates)
    chips.push({ key: 'skipDuplicates', label: 'DEDUP: off' });
  if (f.pageSize !== DEFAULT_FILTERS.pageSize)
    chips.push({ key: 'pageSize', label: `SIZE: ${f.pageSize}` });

  return chips;
};

export const countActiveFilters = (
  f: NewsFilters,
  location: GeoLocation | null,
): number => deriveActiveChips(f, location).length;

/* ====================== ZUSTAND STORE ====================== */

interface FiltersStore {
  /** Применённые фильтры — на их основе строится запрос */
  filters: NewsFilters;
  /** Открыт ли drawer QUERY_PARAMS */
  isDrawerOpen: boolean;
  /** Применить новый набор фильтров (полный апдейт от drawer'а) */
  applyFilters: (next: NewsFilters) => void;
  /** Точечно изменить часть фильтров (для поиска/пагинации/чипсов) */
  patchFilters: (patch: Partial<NewsFilters>) => void;
  /** Сбросить один фильтр в значение по умолчанию */
  removeFilter: (key: FilterKey) => void;
  /** Полный сброс */
  resetFilters: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

/** Ключи, которые можно показывать/удалять как быстрые фильтры */
export type FilterKey = keyof NewsFilters;

export const useFiltersStore = create<FiltersStore>((set) => ({
  filters: DEFAULT_FILTERS,
  isDrawerOpen: false,

  applyFilters: (next) => set({ filters: { ...next, page: 1 } }),

  patchFilters: (patch) =>
    set((state) => ({ filters: { ...state.filters, ...patch } })),

  removeFilter: (key) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: DEFAULT_FILTERS[key],
        // изменение фильтра всегда возвращает на первую страницу
        page: 1,
      },
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
}));
