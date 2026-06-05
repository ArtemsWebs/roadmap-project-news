import { Article } from '../types';
import { CalendarClockIcon, UserIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';

export const NewsCard = ({ article }: { article: Article }) => {
  return (
    <div
      className="flex flex-col gap-6 relative h-full pb-5 border border-cyan-300/40"
      style={{
        background:
          'linear-gradient(180deg, rgba(20, 16, 50, 0.85) 0%, rgba(8, 6, 22, 0.85) 100%);',
      }}
    >
      <Image
        src="/roadmap-project-news/bracket.svg"
        alt=""
        width={14}
        height={14}
        aria-hidden
        className="absolute top-2 left-2"
      />
      {article.image ? (
        <img
          src={article.image ?? ''}
          alt="article"
          width={430}
          height={170}
          className="w-full object-cover"
        />
      ) : (
        <Image
          src="/roadmap-project-news/empty-feed.png"
          alt="no image"
          width={430}
          height={170}
          className="w-full object-cover"
        />
      )}
      <div className="flex flex-col gap-2 p-5 relative h-full">
        <div className="flex flex-row gap-2">
          <CalendarClockIcon className="w-4 h-4 text-cyan-300" />
          <p className="text-sm text-gray-500">
            {formatDate(article.dateTime)}
          </p>
          <UserIcon className="w-4 h-4 text-cyberPink-500" />
          <p className="text-sm text-gray-500">
            {article.authors?.[0]?.name ?? article.source?.title}
          </p>
        </div>
        <p className="text-sm font-bold font-orbitron text-cyan-50">
          {article.title}
        </p>
        <p className=" text-gray-500 text-base ">{article.body}</p>
        <Image
          src="/roadmap-project-news/bracket.svg"
          alt=""
          width={14}
          height={14}
          aria-hidden
          style={{
            top: '99%',
            right: '2%',
          }}
          className="absolute rotate-180"
        />
      </div>
    </div>
  );
};
