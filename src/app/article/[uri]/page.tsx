'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from 'react-query';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  CalendarClock,
  User,
  Eye,
  Clock,
  ImageOff,
} from 'lucide-react';

import styles from '../../cyberpunk-style.module.css';
import TopMenu from '../../component/TopMenu';
import LogoContent from '../../component/LogoContent';
import Footer from '../../component/Footer';
import { CyberLoader } from '@/components/ui/CyberLoader';
import EmptyState from '../../news/view/EmptyState';
import { GradientDivider } from '@/components/ui/GradientDivider';
import { cn, formatDate } from '@/lib/utils';

import fetchArticle from '../../news/articleApi';
import type { ArticleInfo } from '../../news/article.types';
import { ArticleSidebar } from '../components/ArticleSidebar';
import { ReactionBar } from '../components/ReactionBar';
import { CommentsStream } from '../components/CommentsStream';
import { RelatedStreams } from '../components/RelatedStreams';
import { readingTime, shortCategory, toParagraphs } from '../lib';
import { useStatsStore } from '../../profile/statsStore';

/** Псевдо-счётчик просмотров (детерминированный по uri) */
const pseudoViews = (uri: string): string => {
  let h = 0;
  for (let i = 0; i < uri.length; i++) h = (h * 31 + uri.charCodeAt(i)) >>> 0;
  const n = 1000 + (h % 90000);
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
};

/** SAVE / SHARE действия статьи */
const ArticleActions = ({ uri, title }: { uri: string; title: string }) => {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const syncSaved = () => {
      try {
        const list: string[] = JSON.parse(
          localStorage.getItem('neon_saved') ?? '[]',
        );
        setSaved(list.includes(uri));
      } catch {
        /* noop */
      }
    };
    syncSaved();
  }, [uri]);

  const toggleSave = () => {
    try {
      const list: string[] = JSON.parse(
        localStorage.getItem('neon_saved') ?? '[]',
      );
      const next = list.includes(uri)
        ? list.filter((u) => u !== uri)
        : [...list, uri];
      localStorage.setItem('neon_saved', JSON.stringify(next));
      setSaved(next.includes(uri));
    } catch {
      setSaved((s) => !s);
    }
  };

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* отменено */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="flex items-center gap-4 shrink-0">
      <button
        type="button"
        onClick={toggleSave}
        className={cn(
          'flex items-center gap-1 font-tech text-xs tracking-[1px] uppercase transition-colors cursor-pointer',
          saved ? 'text-cyberPink-500' : 'text-slate-400 hover:text-cyan-300',
        )}
      >
        <Bookmark className={cn('w-4 h-4', saved && 'fill-current')} />
        {saved ? 'saved' : 'save'}
      </button>
      <button
        type="button"
        onClick={share}
        className="flex items-center gap-1 font-tech text-xs tracking-[1px] uppercase text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
      >
        <Share2 className="w-4 h-4" />
        {copied ? 'copied' : 'share'}
      </button>
    </div>
  );
};

const ArticleBody = ({ info }: { info: ArticleInfo }) => {
  const paragraphs = toParagraphs(info.body);
  const [lead, ...rest] = paragraphs.length ? paragraphs : [''];
  const category = shortCategory(info.categories?.[0]?.label);
  const concepts = (info.concepts ?? [])
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <article className="min-w-0">
      {/* Бейджи */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {category && (
          <span className="font-tech text-[10px] tracking-[1px] uppercase text-cyberPink-500 border border-cyberPink-500/50 px-2 py-[2px]">
            [{category}]
          </span>
        )}
        <span className="flex items-center gap-1 font-tech text-[10px] tracking-[1px] uppercase text-slate-500 border border-slate-600/60 px-2 py-[2px]">
          <Eye className="w-3 h-3" /> {pseudoViews(info.uri)}
        </span>
        <span className="flex items-center gap-1 font-tech text-[10px] tracking-[1px] uppercase text-slate-500 border border-slate-600/60 px-2 py-[2px]">
          <Clock className="w-3 h-3" /> ~{readingTime(info.body)} мин чтения
        </span>
      </div>

      {/* Заголовок */}
      <h1 className="font-orbitron font-black text-3xl md:text-4xl leading-tight text-cyan-50">
        {info.title}
      </h1>

      {/* Лид */}
      {lead && (
        <p className="font-tech text-base md:text-lg text-slate-400 mt-4 leading-relaxed">
          {lead}
        </p>
      )}

      {/* Мета + действия */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 font-tech text-xs text-slate-500">
            <User className="w-4 h-4 text-cyberPink-500" />
            {(info.source?.title ?? 'UNKNOWN').toUpperCase()}
          </span>
          <span className="flex items-center gap-1 font-tech text-xs text-slate-500">
            <CalendarClock className="w-4 h-4 text-cyan-300" />
            {formatDate(info.dateTime)}
          </span>
        </div>
        <ArticleActions uri={info.uri} title={info.title} />
      </div>

      {/* Картинка */}
      <div className="relative w-full overflow-hidden border border-cyan-300/30 mt-6">
        {info.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={info.image}
            alt={info.title}
            className="w-full max-h-[460px] object-cover"
          />
        ) : (
          <div className="w-full h-[300px] flex flex-col items-center justify-center gap-2 bg-black/40">
            <ImageOff className="w-8 h-8 text-cyan-300/40" />
            <span className="font-tech text-xs text-cyan-300/40 tracking-[1px]">
              NO_SIGNAL.feed
            </span>
          </div>
        )}
      </div>

      {/* Тело */}
      <div className="mt-6 flex flex-col gap-4">
        {rest.map((p, i) => (
          <p
            key={i}
            className="font-tech text-base text-slate-300 leading-relaxed"
          >
            {p}
          </p>
        ))}
      </div>

      {/* Концепты */}
      {concepts.length > 0 && (
        <div className="mt-8">
          <GradientDivider className="mx-auto mb-4" />
          <p className="font-tech text-xs text-slate-500 tracking-[1px] uppercase mb-3">
            {'// entities'}
          </p>
          <div className="flex flex-wrap gap-2">
            {concepts.map((c) => (
              <span
                key={c.uri}
                className="font-tech text-xs tracking-[0.5px] text-cyan-300 border border-cyan-300/30 px-2 py-[3px] hover:border-cyan-300/70 transition-colors"
              >
                {c.label?.eng ?? c.uri}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default function ArticlePage() {
  const params = useParams<{ uri: string }>();
  const rawUri = Array.isArray(params.uri) ? params.uri[0] : params.uri;
  const uri = rawUri ? decodeURIComponent(rawUri) : '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['article', uri],
    queryFn: () => fetchArticle(uri),
    enabled: !!uri,
  });

  const info = data?.info;
  const related = data?.duplicatedArticles?.results ?? [];

  const markRead = useStatsStore((s) => s.markRead);
  useEffect(() => {
    if (info?.uri) markRead(info.uri);
  }, [info?.uri, markRead]);

  return (
    <div className={styles['cp-root']}>
      <div className={styles['cp-scanlines']}></div>

      <header>
        <TopMenu />
        <LogoContent />
      </header>

      <main className="w-[92%] md:w-[88%] lg:w-[80%] xl:w-[72%] mx-auto py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-tech text-xs tracking-[1px] uppercase text-cyan-300 hover:text-cyan-100 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> {'<< back_to_feed'}
        </Link>

        {isLoading ? (
          <CyberLoader label="DECRYPTING_ARTICLE" />
        ) : error || !info ? (
          <EmptyState
            title="SIGNAL_LOST"
            message={
              error instanceof Error
                ? error.message
                : 'статья не найдена или канал недоступен.'
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
              <ArticleBody info={info} />
              <ArticleSidebar info={info} />
            </div>

            <ReactionBar originalUrl={info.url} />
            <CommentsStream />
            <RelatedStreams items={related} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
