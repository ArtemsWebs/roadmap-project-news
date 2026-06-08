import type { ArticleInfo } from '../../news/article.types';
import { NewsCard } from '../../news/view/NewsCard';
import { infoToArticle } from '../lib';

export const RelatedStreams = ({ items }: { items: ArticleInfo[] }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-[5px] h-[18px] bg-cyberPink-500 rounded-full" />
        <h2 className="font-orbitron font-bold text-xl tracking-[2px] text-sky-100">
          RELATED_STREAMS
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {items.slice(0, 4).map((a) => (
          <NewsCard
            key={a.uri}
            article={infoToArticle(a)}
            className="max-h-[520px] h-[455px]"
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedStreams;
