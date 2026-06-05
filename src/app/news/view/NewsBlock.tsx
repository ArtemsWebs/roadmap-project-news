import NewsTitle from './NewsTitle';
import NewsContent from './NewsContent';
import { Article } from '../types';

export const NewsBlock = ({ articles }: { articles: Article[] }) => {
  if (!articles) return null;
  return (
    <div className="flex flex-col gap-4">
      <NewsTitle />
      <NewsContent articles={articles} />
    </div>
  );
};
