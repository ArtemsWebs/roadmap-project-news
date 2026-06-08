'use client';

import { useState } from 'react';
import { Zap, Hand, Eye, Flame, Skull, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStatsStore } from '../../profile/statsStore';

interface Reaction {
  id: string;
  icon: React.ReactNode;
  count: number;
}

const INITIAL: Reaction[] = [
  { id: 'zap', icon: <Zap className="w-4 h-4" />, count: 1247 },
  { id: 'hand', icon: <Hand className="w-4 h-4" />, count: 482 },
  { id: 'eye', icon: <Eye className="w-4 h-4" />, count: 3184 },
  { id: 'flame', icon: <Flame className="w-4 h-4" />, count: 891 },
  { id: 'skull', icon: <Skull className="w-4 h-4" />, count: 56 },
];

export const ReactionBar = ({ originalUrl }: { originalUrl: string }) => {
  const [reactions, setReactions] = useState<Reaction[]>(INITIAL);
  const [active, setActive] = useState<string | null>(null);
  const addReaction = useStatsStore((s) => s.addReaction);

  const react = (id: string) => {
    const wasActive = active === id;
    setReactions((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return { ...r, count: r.count + (wasActive ? -1 : 1) };
      }),
    );
    setActive((cur) => (cur === id ? null : id));
    if (!wasActive) addReaction();
  };

  return (
    <div
      className="border border-cyan-300/30 p-4 mt-8"
      style={{ background: 'rgba(10, 10, 26, 0.5)' }}
    >
      <p className="font-tech text-xs text-slate-500 tracking-[1px] mb-3">
        {'// ваша реакция'}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {reactions.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => react(r.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1 border font-tech text-sm transition-all cursor-pointer',
              active === r.id
                ? 'border-cyberPink-500 text-cyberPink-500 bg-cyberPink-500/10 shadow-[0_0_8px_rgba(255,43,214,0.4)]'
                : 'border-cyan-300/30 text-slate-400 hover:border-cyan-300/70 hover:text-cyan-200',
            )}
          >
            {r.icon}
            {r.count}
          </button>
        ))}
      </div>
      <a
        href={originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-tech text-xs text-cyan-300 hover:text-cyan-100 tracking-[0.5px] transition-colors mt-4"
      >
        открыть оригинал источника <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};

export default ReactionBar;
