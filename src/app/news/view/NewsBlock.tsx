import NewsTitle from './NewsTitle';
import NewsContent from './NewsContent';
import { ArticlesResult } from '../types';
import { cn } from '@/lib/utils';

interface NewsBlockProps {
  articles?: ArticlesResult;
  page: number;
  onPageChange: (page: number) => void;
}

const PagerButton = ({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'px-6 py-2 font-orbitron font-bold text-sm tracking-widest uppercase border transition-colors',
      disabled
        ? 'border-slate-700 text-slate-600 cursor-not-allowed'
        : 'border-cyan-300/60 text-cyan-300 hover:bg-cyan-300/10 hover:text-cyan-100 cursor-pointer',
    )}
  >
    {children}
  </button>
);

export const NewsBlock = ({ articles, page, onPageChange }: NewsBlockProps) => {
  if (!articles) return null;

  const { results, totalResults, pages } = articles;

  console.log(results);

  return (
    <div className="flex flex-col gap-4">
      <NewsTitle page={page} shown={results.length} total={totalResults} />
      <NewsContent articles={results} />
      <div className="flex items-center justify-center gap-4 mt-8">
        <PagerButton
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {'<< PREV'}
        </PagerButton>
        <PagerButton
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          {'NEXT >>'}
        </PagerButton>
      </div>
    </div>
  );
};
