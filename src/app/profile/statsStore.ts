import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StatsState {
  readArticles: string[]; // уникальные uri прочитанных статей
  reactions: number;
  ttsListens: number;
  searches: number;
  markRead: (uri: string) => void;
  addReaction: () => void;
  addTtsListen: () => void;
  addSearch: () => void;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      readArticles: [],
      reactions: 0,
      ttsListens: 0,
      searches: 0,
      markRead: (uri) =>
        set((s) =>
          uri && !s.readArticles.includes(uri)
            ? { readArticles: [...s.readArticles, uri] }
            : {},
        ),
      addReaction: () => set((s) => ({ reactions: s.reactions + 1 })),
      addTtsListen: () => set((s) => ({ ttsListens: s.ttsListens + 1 })),
      addSearch: () => set((s) => ({ searches: s.searches + 1 })),
    }),
    { name: 'neon-news-stats' },
  ),
);

/** Вычисляемый ранг нетраннера по суммарной активности. */
export function netrunnerLevel(s: {
  readArticles: string[];
  reactions: number;
  ttsListens: number;
  searches: number;
}): { level: number; rank: string } {
  const score =
    s.readArticles.length * 2 + s.reactions + s.ttsListens * 3 + s.searches;
  const level = Math.floor(Math.sqrt(score));
  const rank =
    level >= 12
      ? 'LEGEND'
      : level >= 7
        ? 'ICEBREAKER'
        : level >= 3
          ? 'RUNNER'
          : 'ROOKIE';
  return { level, rank };
}
