import type { NewsApiResponse } from './types';

const ENDPOINT = 'https://eventregistry.org/api/v1/article/getArticles';

const fetchNews = async (): Promise<NewsApiResponse> => {
  const params = new URLSearchParams({
    apiKey: process.env.NEXT_PUBLIC_API_KEY ?? '',
    resultType: 'articles',
    lang: 'eng',
    articlesSortBy: 'date',
    articlesSortByAsc: 'false',
    articlesCount: '30',
    articlesPage: '1',
    dataType: 'news',
    includeArticleImage: 'true',
  });

  const response = await fetch(`${ENDPOINT}?${params.toString()}`);
  const data: NewsApiResponse = await response.json();
  return data;
};

export default fetchNews;
