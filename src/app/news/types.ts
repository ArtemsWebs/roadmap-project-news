/** Источник статьи — `article.source` (Event Registry) */
export interface ArticleSource {
  /** Домен источника, напр. `"rmol.co"` */
  uri: string;
  /** Тип данных источника: `"news" | "pr" | "blog"` */
  dataType: string;
  /** Отображаемое имя источника, напр. `"rmol.co"` */
  title: string;
}

/** Автор статьи — элемент `article.authors[]` */
export interface ArticleAuthor {
  /** Идентификатор автора в Event Registry */
  uri: string;
  /** Имя автора */
  name: string;
  /** Тип автора, напр. `"author"` */
  type: string;
  /** Является ли автор информационным агентством */
  isAgency: boolean;
}

/**
 * Одна статья из `articles.results[]`
 * (Event Registry → POST/GET /api/v1/article/getArticles).
 *
 * @example
 * {
 *   uri: "7546825937",
 *   lang: "eng",
 *   date: "2023-05-16",
 *   time: "10:35:00",
 *   dateTime: "2023-05-16T10:35:00Z",
 *   dateTimePub: "2023-05-16T10:34:00Z",
 *   dataType: "news",
 *   url: "https://www.rmol.co/20230516/...",
 *   title: "Tesla Changed A Deadline For Investor Proposals...",
 *   body: "Tesla investors will have fewer opportunities...",
 *   source: { uri: "rmol.co", dataType: "news", title: "rmol.co" },
 *   authors: [],
 *   image: "https://www.rmol.co/wp-content/uploads/2023/05/...jpg",
 *   sentiment: 0.0196,
 *   relevance: 100
 * }
 */
export interface Article {
  /** Уникальный идентификатор статьи в Event Registry */
  uri: string;
  /** Язык статьи (ISO 639-3), напр. `"eng"` */
  lang: string;
  /** Является ли статья дубликатом другой */
  isDuplicate: boolean;
  /** Дата публикации `YYYY-MM-DD` */
  date: string;
  /** Время публикации `HH:mm:ss` (UTC) */
  time: string;
  /** Дата и время в UTC, ISO 8601 — напр. `"2023-05-16T10:35:00Z"` */
  dateTime: string;
  /** Дата и время публикации по данным источника, ISO 8601 */
  dateTimePub: string;
  /** Тип данных: `"news" | "pr" | "blog"` */
  dataType: string;
  /** Коэффициент схожести с другими статьями кластера */
  sim: number;
  /** URL оригинальной публикации */
  url: string;
  /** Полный заголовок статьи */
  title: string;
  /** Текст статьи (часто урезанный) */
  body: string;
  /** Источник статьи */
  source: ArticleSource;
  /** Авторы статьи; пустой массив, если не указаны */
  authors: ArticleAuthor[];
  /** URL изображения; `null`, если картинки нет */
  image: string | null;
  /** Идентификатор связанного события; `null`, если отсутствует */
  eventUri: string | null;
  /** Тональность статьи в диапазоне `[-1, 1]`; `null`, если не вычислена */
  sentiment: number | null;
  /** Внутренний вес статьи */
  wgt: number;
  /** Релевантность запросу `[0, 100]` */
  relevance: number;
}

/** Объект `articles` в ответе getArticles */
export interface ArticlesResult {
  /** Список статей на текущей странице */
  results: Article[];
  /** Общее число найденных статей */
  totalResults: number;
  /** Номер текущей страницы (с 1) */
  page: number;
  /** Число статей на странице */
  count: number;
  /** Общее число страниц */
  pages: number;
}

/** Успешный ответ GET/POST /api/v1/article/getArticles */
export interface NewsApiSuccessResponse {
  articles: ArticlesResult;
}

/** Ответ при ошибке (неверный ключ, лимит и т.д.) */
export interface NewsApiErrorResponse {
  /** Текст ошибки от Event Registry */
  error: string;
}

export type NewsApiResponse = NewsApiSuccessResponse | NewsApiErrorResponse;

export function isNewsApiSuccess(
  response: NewsApiResponse,
): response is NewsApiSuccessResponse {
  return (
    response != null &&
    'articles' in response &&
    response.articles != null &&
    Array.isArray(response.articles.results)
  );
}
