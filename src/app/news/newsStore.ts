import { create } from "zustand";
import type { Article, NewsApiResponse } from "./types";
import { isNewsApiSuccess } from "./types";

type FetchStatus = "idle" | "loading" | "success" | "error";

interface NewsStoreState {
  articles: Article[];
  totalResults: number;
  status: FetchStatus;
  error: string | null;
}

interface NewsStoreActions {
  setLoading: () => void;
  setFromResponse: (response: NewsApiResponse) => void;
  setArticles: (articles: Article[], totalResults?: number) => void;
  setError: (message: string) => void;
  reset: () => void;
}

export type NewsStore = NewsStoreState & NewsStoreActions;

const initialState: NewsStoreState = {
  articles: [],
  totalResults: 0,
  status: "idle",
  error: null,
};

export const useNewsStore = create<NewsStore>((set) => ({
  ...initialState,

  setLoading: () =>
    set({ status: "loading", error: null }),

  setFromResponse: (response) => {
    if (isNewsApiSuccess(response)) {
      set({
        articles: response.articles.results,
        totalResults: response.articles.totalResults,
        status: "success",
        error: null,
      });
      return;
    }
    set({
      status: "error",
      error: response.error,
    });
  },

  setArticles: (articles, totalResults = articles.length) =>
    set({
      articles,
      totalResults,
      status: "success",
      error: null,
    }),

  setError: (message) =>
    set({ status: "error", error: message }),

  reset: () => set(initialState),
}));
