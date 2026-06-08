'use client';

import { useState } from 'react';
import { CornerDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentNode {
  id: string;
  author: string;
  handle: string;
  color: string;
  time: string;
  text: string;
  replies?: CommentNode[];
}

/** Демонстрационная ветка (моки в духе Найт-Сити) */
const MOCK: CommentNode[] = [
  {
    id: 'c1',
    author: 'Johnny Silverhand',
    handle: '@silverhand_v',
    color: 'text-yellow-300',
    time: '1ч назад',
    text: 'Очередная корпоративная пропаганда. Седьмое поколение — это просто перепакованное шестое с новой подсветкой. Не ведитесь.',
    replies: [
      {
        id: 'c1r1',
        author: 'Alt Cunningham',
        handle: '@alt.exe',
        color: 'text-cyan-300',
        time: '1ч назад',
        text: 'Не совсем. Архитектура памяти переработана — я тестировала прототип в марте. Latency упала в 3 раза.',
        replies: [
          {
            id: 'c1r1r1',
            author: 'Johnny Silverhand',
            handle: '@silverhand_v',
            color: 'text-cyberPink-500',
            time: '1ч назад',
            text: 'Альт, ты под NDA. Откуда такая щедрость?',
          },
        ],
      },
    ],
  },
  {
    id: 'c2',
    author: 'T-Bug',
    handle: '@tbug.netrunner',
    color: 'text-yellow-300',
    time: '2ч назад',
    text: 'Кто-нибудь уже разобрал прошивку? Интересует, какая криптография на ICE — RSA-классика или что-то постквантовое.',
  },
];

const Avatar = ({ name }: { name: string }) => (
  <span className="shrink-0 w-7 h-7 flex items-center justify-center border border-cyan-300/40 font-tech text-[10px] text-cyan-300">
    {name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()}
  </span>
);

const Comment = ({ node, depth = 0 }: { node: CommentNode; depth?: number }) => (
  <div className={cn(depth > 0 && 'ml-5 pl-4 border-l border-cyan-300/15')}>
    <div className="flex gap-3 py-3">
      <Avatar name={node.author} />
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('font-orbitron font-bold text-sm', node.color)}>
            {node.author}
          </span>
          <span className="font-tech text-xs text-slate-600">{node.handle}</span>
          <span className="font-tech text-xs text-slate-600">· {node.time}</span>
        </div>
        <p className="font-tech text-sm text-slate-300 mt-1 leading-relaxed">
          {node.text}
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-1 font-tech text-xs text-slate-500 hover:text-cyan-300 mt-2 transition-colors cursor-pointer"
        >
          <CornerDownRight className="w-3 h-3" /> reply
        </button>
      </div>
    </div>
    {node.replies?.map((r) => (
      <Comment key={r.id} node={r} depth={depth + 1} />
    ))}
  </div>
);

export const CommentsStream = () => {
  const [comments, setComments] = useState<CommentNode[]>(MOCK);
  const [draft, setDraft] = useState('');

  const total = (nodes: CommentNode[]): number =>
    nodes.reduce((n, c) => n + 1 + (c.replies ? total(c.replies) : 0), 0);

  const transmit = () => {
    const text = draft.trim();
    if (!text) return;
    setComments((prev) => [
      {
        id: `me-${Date.now()}`,
        author: 'YOU',
        handle: '@you.local',
        color: 'text-cyan-300',
        time: 'только что',
        text,
      },
      ...prev,
    ]);
    setDraft('');
  };

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-[5px] h-[18px] bg-cyberPink-500 rounded-full" />
        <h2 className="font-orbitron font-bold text-xl tracking-[2px] text-sky-100">
          COMMENTS_STREAM
        </h2>
        <span className="font-tech text-sm text-slate-500">
          [{total(comments)}]
        </span>
      </div>

      {/* Поле ввода */}
      <div
        className="border border-cyan-300/30 p-4"
        style={{ background: 'rgba(10, 10, 26, 0.5)' }}
      >
        <p className="font-tech text-xs text-slate-500 mb-2">▸ войти в поток</p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder="▸ ваш сигнал в сеть ..."
          className="w-full bg-black/55 border border-cyan-300/30 text-cyan-100 placeholder:text-cyan-300/30 font-tech text-sm px-3 py-2 outline-none resize-none focus:border-cyan-300 focus:shadow-[0_0_6px_#22d3ee] transition-all"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="font-tech text-xs text-slate-600">
            подписано: YOU @you.local
          </span>
          <button
            type="button"
            onClick={transmit}
            className="group relative px-5 py-2 font-orbitron font-bold text-cyan-300 text-sm tracking-[2px] cursor-pointer overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#0a2a2a] to-[#1a0a2e] transition-all group-hover:from-[#00F0FF]/20 group-hover:to-[#7C3AED]/30" />
            <span className="absolute inset-0 border border-cyan-300/70 group-hover:shadow-[0_0_12px_#00F0FF] transition-all" />
            <span className="relative">TRANSMIT {'>>'}</span>
          </button>
        </div>
      </div>

      {/* Ветка */}
      <div className="mt-4 divide-y divide-cyan-300/10">
        {comments.map((c) => (
          <Comment key={c.id} node={c} />
        ))}
      </div>
    </div>
  );
};

export default CommentsStream;
