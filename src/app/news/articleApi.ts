import {
  ArticleResult,
  GetArticleApiResponse,
  isGetArticleError,
} from './article.types';

const ENDPOINT = 'https://eventregistry.org/api/v1/article/getArticle';

/**
 * Тянет одну статью по URI через Event Registry article/getArticle.
 * Возвращает запись { info, duplicatedArticles?, originalArticle? } либо null.
 */
export const fetchArticle = async (
  uri: string,
): Promise<ArticleResult | null> => {
  const params = new URLSearchParams();
  params.set('apiKey', process.env.NEXT_PUBLIC_API_KEY ?? '');
  params.append('articleUri', uri);
  params.set('resultType', 'info');

  // Полное тело + максимум полей (returnInfo-флаги getArticle)
  params.set('infoArticleBodyLen', '-1');
  params.set('includeArticleConcepts', 'true');
  params.set('includeArticleCategories', 'true');
  params.set('includeArticleLocation', 'true');
  params.set('includeArticleImage', 'true');
  params.set('includeArticleLinks', 'true');
  params.set('includeArticleVideos', 'true');
  params.set('includeArticleExtractedDates', 'true');
  params.set('includeArticleDuplicateList', 'true');
  params.set('includeArticleOriginalArticle', 'true');
  params.set('includeConceptLabel', 'true');
  params.set('includeConceptImage', 'true');
  params.set('includeCategoryLabel', 'true');
  params.set('includeSourceDescription', 'true');
  params.set('includeSourceRanking', 'true');
  params.set('includeSourceLocation', 'true');

  const response = await fetch(`${ENDPOINT}?${params.toString()}`);
  const data: GetArticleApiResponse = await response.json();

  if (isGetArticleError(data)) {
    throw new Error(data.error);
  }

  // Ответ — словарь по URI; берём точное совпадение либо первую запись
  const entry = data[uri] ?? Object.values(data)[0];
  if (!entry || !entry.info) return null;

  return entry;
};

export default fetchArticle;
