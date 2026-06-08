import { Article } from '../types';
import {
  CalendarClockIcon,
  UserIcon,
  ArrowRightIcon,
  ImageOffIcon,
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import styles from './News.module.css';
import { GradientDivider } from '@/components/ui/GradientDivider';
import Image from 'next/image';
import Link from 'next/link';
import { GrayDivider } from '@/components/ui/GrayDivider';

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
    <Link
      href={`/article/${encodeURIComponent(article.uri)}`}
      className={cn(
        'group flex flex-col relative h-full border border-cyan-300/40 min-w-[350px]',
        styles.card,
        className,
      )}
      style={{
        background:
          'linear-gradient(180deg, rgba(20, 16, 50, 0.85) 0%, rgba(8, 6, 22, 0.85) 100%)',
      }}
    >
      <Image
        src={'/roadmap-project-news/bracket.svg'}
        alt="News Card Background"
        width={14}
        height={14}
        className={cn('absolute top-1 left-1 z-10', styles.corner)}
      />

      <div className="flex flex-col h-full">
        {/* Изображение / NO_SIGNAL */}
        <div className="relative w-full overflow-hidden">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className={cn(
                'w-full object-cover',
                styles.cardImage,
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
          className={cn(
            'flex flex-col justify-between gap-2 p-5 relative',
            styles.newsCard,
          )}
        >
          <div className="h-1/2">
            <div className="flex flex-row items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <CalendarClockIcon className="w-4 h-4 text-cyan-300" />
                <p className="font-tech text-sm text-gray-500">
                  {formatDate(article.dateTime)}
                </p>
              </div>
              <GrayDivider className="mx-2 h-[20px]" />
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-cyberPink-500" />
                <p className="font-tech text-sm text-gray-500">
                  {authorName(article)}
                </p>
              </div>
            </div>

            <p
              className={cn(
                'font-bold font-orbitron text-cyan-50 py-2',
                styles.glitchTitle,
                featured ? 'text-2xl leading-snug' : 'text-sm',
              )}
            >
              {article.title}
            </p>

            {article.body ? (
              <p
                className={cn(
                  featured
                    ? styles['text-ellipsis-break-news']
                    : styles['text-ellipsis-base'],
                  'text-gray-500 text-base h-full overflow-hidden',
                )}
              >
                {article.body}
              </p>
            ) : (
              <p className="font-tech text-gray-600 italic text-sm">
                {'// description.stream = null'}
              </p>
            )}
          </div>
          <div>
            <GradientDivider className="mx-auto" />
            {/* Футер: ID источника + READ_MORE (вся карточка — ссылка) */}
            <div className="flex items-center relative justify-between mt-auto pt-4">
              <span className="font-tech text-xs text-slate-500 tracking-[0.5px]">
                ID://{sourceSlug(article)}
              </span>
              <span className="flex items-center gap-1 font-tech text-xs text-cyan-300 group-hover:text-cyan-100 tracking-[0.5px] transition-colors">
                READ_MORE
                <ArrowRightIcon className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </span>
              <Image
                src={'/roadmap-project-news/bracket.svg'}
                alt="News Card Background"
                width={14}
                height={14}
                className={cn(
                  'absolute top-[33px] left-full rotate-180',
                  styles.corner,
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
