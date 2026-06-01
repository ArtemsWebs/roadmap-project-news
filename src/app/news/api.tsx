import type { NewsApiResponse } from "./types";

const fetchNews = async (): Promise<NewsApiResponse> => {
  const response = await fetch(
    `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`,
  );
  const data: NewsApiResponse = await response.json();
  return data;
};

export default fetchNews;