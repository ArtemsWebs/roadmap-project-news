import { NewsCard } from './NewsCard';
import { Article } from '../types';
import { cn } from '@/lib/utils';

const NewsContent = ({ articles }: { articles: Article[] }) => {
  const mainArticles = articles.slice(0, 3);
  const otherArticles = articles.slice(3);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-6 grid-rows-6 gap-4 max-h-[935px]">
        {mainArticles.map((article, index) => (
          <div
            key={article.url}
            className={cn(
              index === 0 ? 'row-span-6 col-span-4' : 'row-span-3 col-span-2',
            )}
          >
            <NewsCard article={article} featured={index === 0} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {otherArticles.map((article) => (
          <NewsCard
            key={article.url}
            article={article}
            className={'max-h-[500px]'}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsContent;
