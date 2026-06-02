'use client';

import { useEffect, useRef } from 'react';
import { NewsApiSuccessResponse } from '../news/types';

const SEPARATOR = '//';

const CrawlLine = ({ news }: { news: NewsApiSuccessResponse }) => {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Дублируем контент для бесшовного зацикливания
    const original = track.innerHTML;
    track.innerHTML = original + original;

    const totalWidth = track.scrollWidth / 2;
    let pos = 0;
    let raf: number;

    const step = () => {
      pos += 0.6; // px за кадр — скорость
      if (pos >= totalWidth) pos = 0;
      track.style.transform = `translateX(-${pos}px)`;
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [news]);

  const articles = news?.articles?.slice(0, 10) ?? [];

  return (
    <div className="relative h-[40px] overflow-hidden bg-lime-green border-y border-[#F7FF3C]/30 flex items-center">
      {/* fade edges */}
      <div className="absolute left-0 top-0 h-full w-16 z-10 bg-gradient-to-r from-[#0a0a1a] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-16 z-10 bg-gradient-to-l from-[#0a0a1a] to-transparent pointer-events-none" />

      <div
        ref={trackRef}
        className="flex items-center gap-0 whitespace-nowrap will-change-transform"
      >
        {articles.map((article) => (
          <span key={article.url} className="flex items-center gap-8">
            <span className="text-sm text-yellow-300 font-tech px-4">
              {article.title}
            </span>
            <span className="text-[#F7FF3C]/40 font-tech text-xs">
              {SEPARATOR}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default CrawlLine;
