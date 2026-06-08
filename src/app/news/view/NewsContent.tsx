import { NewsCard } from './NewsCard';
import { Article } from '../types';
import { cn } from '@/lib/utils';

const NewsContent = ({ articles }: { articles: Article[] }) => {
  const mainArticles = articles.slice(0, 3);
  const otherArticles = articles.slice(3);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-6 lg:grid-rows-6 gap-4 lg:max-h-[935px]">
        {mainArticles.map((article, index) => (
          <div
            key={article.url}
            className={cn(
              index === 0
                ? '2xl:row-span-6 2xl:col-span-4 lg:row-span-3 lg:col-span-6'
                : '2xl:row-span-3 2xl:col-span-2 lg:row-span-3 lg:col-span-3',
            )}
          >
            <NewsCard article={article} featured={index === 0} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
        {otherArticles.map((article) => (
          <NewsCard
            key={article.url}
            article={article}
            className={'max-h-[500px] h-[455px]'}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsContent;
