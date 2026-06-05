import { Article } from '../types';
import {
  CalendarClockIcon,
  UserIcon,
  ExternalLinkIcon,
  ImageOffIcon,
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import styles from './News.module.css';
import { GradientDivider } from '@/components/GradientDivider';

/** `"rmol.co"` → `"rmol.co"`; используется в `ID://...` */
const sourceSlug = (article: Article) =>
  article.source?.uri || article.source?.title || 'unknown';

/** Имя автора в верхнем регистре или `ANONYMOUS` */
const authorName = (article: Article) =>
  (article.authors?.[0]?.name ?? 'ANONYMOUS').toUpperCase();

/** PR/блоги помечаем как непроверенный источник */
const isUnverified = (article: Article) => article.dataType !== 'news';

export const NewsCard = ({
  article,
  featured = false,
  className,
}: {
  article: Article;
  featured?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'flex flex-col relative h-full border border-cyan-300/40',
        className,
      )}
      style={{
        background:
          'linear-gradient(180deg, rgba(20, 16, 50, 0.85) 0%, rgba(8, 6, 22, 0.85) 100%)',
      }}
    >
      <div className="flex flex-col h-full">
        {/* Изображение / NO_SIGNAL */}
        <div className="relative w-full">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className={cn(
                'w-full object-cover',
                featured ? 'h-[320px]' : 'h-[170px]',
              )}
            />
          ) : (
            <div
              className={cn(
                'w-full flex flex-col items-center justify-center gap-2 bg-black/40 border-b border-cyan-300/20',
                featured ? 'h-[320px]' : 'h-[170px]',
              )}
            >
              <ImageOffIcon className="w-6 h-6 text-cyan-300/40" />
              <span className="font-tech text-xs text-cyan-300/40 tracking-[1px]">
                NO_SIGNAL.feed
              </span>
            </div>
          )}

          {/* Тег источника + статус поверх изображения */}
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <span className="font-tech text-[10px] tracking-[1px] uppercase text-cyan-300 border border-cyan-300/60 bg-[#0a0a1a]/80 px-2 py-[2px]">
              [{(article.source?.title ?? 'UNKNOWN').toUpperCase()}]
            </span>
            {isUnverified(article) && (
              <span className="font-tech text-[10px] tracking-[1px] uppercase text-yellow-300 border border-yellow-300/60 bg-[#0a0a1a]/80 px-2 py-[2px]">
                UNVERIFIED
              </span>
            )}
          </div>
        </div>

        {/* Контент */}
        <div
          className={cn('flex flex-col gap-2 p-5 relative', styles.newsCard)}
        >
          <div className="flex flex-row items-center gap-2 flex-wrap">
            <CalendarClockIcon className="w-4 h-4 text-cyan-300" />
            <p className="font-tech text-sm text-gray-500">
              {formatDate(article.dateTime)}
            </p>
            <UserIcon className="w-4 h-4 text-cyberPink-500" />
            <p className="font-tech text-sm text-gray-500">
              {authorName(article)}
            </p>
          </div>

          <p
            className={cn(
              'font-bold font-orbitron text-cyan-50',
              featured ? 'text-2xl leading-snug' : 'text-sm',
            )}
          >
            {article.title}
          </p>

          {article.body ? (
            <p
              className={cn(
                featured
                  ? styles.textEllipsisBreakNews
                  : styles.textEllipsisBase,
                'text-gray-500 text-base wq max-h-[50%] overflow-hidden',
              )}
            >
              {article.body}
            </p>
          ) : (
            <p className="font-tech text-gray-600 italic text-sm">
              {'// description.stream = null'}
            </p>
          )}
          <div>
            <GradientDivider className="mx-auto" />
            {/* Футер: ID источника + READ_MORE */}
            <div className="flex items-center justify-between mt-auto pt-4">
              <span className="font-tech text-xs text-slate-500 tracking-[0.5px]">
                ID://{sourceSlug(article)}
              </span>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-tech text-xs text-cyan-300 hover:text-cyan-100 tracking-[0.5px] transition-colors"
              >
                READ_MORE
                <ExternalLinkIcon className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
