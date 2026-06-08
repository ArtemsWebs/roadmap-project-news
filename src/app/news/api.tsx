import type { NewsApiResponse } from './types';
import type { NewsFilters } from './filters/model';
import { DEFAULT_FILTERS } from './filters/model';

const ENDPOINT = 'https://eventregistry.org/api/v1/article/getArticles';

const splitCsv = (value: string): string[] =>
  value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

/**
 * Строит query Event Registry из набора фильтров и тянет статьи.
 * Все имена параметров — реальные параметры article/getArticles.
 */
const fetchNews = async (
  filters: NewsFilters = DEFAULT_FILTERS,
): Promise<NewsApiResponse> => {
  const params = new URLSearchParams();

  params.set('apiKey', process.env.NEXT_PUBLIC_API_KEY ?? '');
  params.set('resultType', 'articles');
  params.set('includeArticleImage', 'true');

  // --- keyword ---
  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
    params.set('keywordOper', filters.keywordOper);
    params.set('keywordLoc', filters.keywordLoc);
  }
  if (filters.ignoreKeyword.trim()) {
    params.set('ignoreKeyword', filters.ignoreKeyword.trim());
  }

  // --- sources ---
  splitCsv(filters.sourceUri).forEach((s) => params.append('sourceUri', s));
  splitCsv(filters.ignoreSourceUri).forEach((s) =>
    params.append('ignoreSourceUri', s),
  );

  // --- languages (повторяемый параметр) ---
  filters.lang.forEach((l) => params.append('lang', l));

  // --- dataType (повторяемый параметр) ---
  filters.dataType.forEach((d) => params.append('dataType', d));

  // --- даты ---
  if (filters.dateStart) params.set('dateStart', filters.dateStart);
  if (filters.dateEnd) params.set('dateEnd', filters.dateEnd);

  // --- дубликаты ---
  if (filters.skipDuplicates) params.set('isDuplicateFilter', 'skipDuplicates');

  // --- сортировка ---
  params.set('articlesSortBy', filters.sortBy);
  params.set('articlesSortByAsc', 'false');

  // --- пагинация ---
  params.set('articlesCount', String(filters.pageSize));
  params.set('articlesPage', String(filters.page));

  const response = await fetch(`${ENDPOINT}?${params.toString()}`);
  const data: NewsApiResponse = await response.json();
  return data;
};

export default fetchNews;
