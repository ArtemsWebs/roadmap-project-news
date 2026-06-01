/** Источник статьи (News API → article.source) */
export interface ArticleSource {
  id: string | null;
  name: string;
}

/** Одна статья из массива articles */
export interface Article {
  source: ArticleSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

/** Успешный ответ GET /v2/top-headlines */
export interface NewsApiSuccessResponse {
  status: "ok";
  totalResults: number;
  articles: Article[];
}

/** Ответ при ошибке (неверный ключ, лимит и т.д.) */
export interface NewsApiErrorResponse {
  status: "error";
  code: string;
  message: string;
}

export type NewsApiResponse = NewsApiSuccessResponse | NewsApiErrorResponse;

export function isNewsApiSuccess(
  response: NewsApiResponse,
): response is NewsApiSuccessResponse {
  return response.status === "ok";
}
