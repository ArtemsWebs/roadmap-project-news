'use client';

import {
  BrainCircuit,
  ShieldCheck,
  Headphones,
  Coins,
  Languages,
  Activity,
  Check,
  TriangleAlert,
} from 'lucide-react';
import type { ArticleInfo } from '../../news/article.types';
import { Panel } from './Panel';
import { AudioStream } from './AudioStream';
import { deriveMood, trustScore, tldrBullets } from '../lib';
import { cn } from '@/lib/utils';
import ProfileCard from '@/components/profile/ProfileCard';

const TipButton = ({ amount }: { amount: number }) => (
  <button
    type="button"
    className="flex-1 border border-yellow-300/40 text-yellow-300 font-tech text-sm py-2 hover:bg-yellow-300/10 transition-colors cursor-pointer"
  >
    {amount}
  </button>
);

const TrustRow = ({
  label,
  value,
  ok = true,
  warn = false,
}: {
  label: string;
  value: string;
  ok?: boolean;
  warn?: boolean;
}) => (
  <div className="flex items-center justify-between py-[3px]">
    <span className="font-tech text-xs text-slate-500">{label}</span>
    <span
      className={cn(
        'font-tech text-xs flex items-center gap-1',
        warn ? 'text-yellow-300' : ok ? 'text-emerald-300' : 'text-slate-400',
      )}
    >
      {warn ? (
        <TriangleAlert className="w-3 h-3" />
      ) : (
        <Check className="w-3 h-3" />
      )}
      {value}
    </span>
  </div>
);

export const ArticleSidebar = ({ info }: { info: ArticleInfo }) => {
  const score = trustScore(info.source?.ranking?.importanceRank);
  const mood = deriveMood(info.uri);
  const bullets = tldrBullets(info.body);

  return (
    <aside className="flex flex-col gap-4">
      <ProfileCard variant="sidebar" />

      {/* NEURAL_TLDR — выжимка из тела статьи */}
      <Panel
        title="NEURAL_TLDR"
        icon={<BrainCircuit className="w-4 h-4" />}
        badge="AI"
        badgeTone="ai"
      >
        <ol className="flex flex-col gap-2">
          {bullets.length > 0 ? (
            bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-tech text-xs text-cyberPink-500 shrink-0">
                  {String(i + 1).padStart(2, '0')} ▸
                </span>
                <span className="font-tech text-xs text-slate-300 leading-relaxed">
                  {b}
                </span>
              </li>
            ))
          ) : (
            <li className="font-tech text-xs text-slate-500 italic">
              {'// выжимка недоступна'}
            </li>
          )}
        </ol>
        <p className="font-tech text-[10px] text-slate-600 mt-3">
          сгенерировано neon-gpt
        </p>
      </Panel>

      {/* TRUST_SCORE — из importanceRank источника */}
      <Panel
        title="TRUST_SCORE"
        icon={<ShieldCheck className="w-4 h-4" />}
        badge="LIVE"
        badgeTone="live"
      >
        <div className="flex items-end gap-2">
          <span className="font-orbitron font-black text-4xl text-cyan-300 leading-none">
            {score}
          </span>
          <span className="font-tech text-xs text-slate-500 mb-1">
            / 100 verified
          </span>
        </div>
        <div className="h-[6px] w-full bg-slate-700/50 mt-3 mb-4 overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${score}%`,
              background: 'linear-gradient(90deg, #00F0FF, #F7FF3C)',
            }}
          />
        </div>
        <TrustRow
          label="источник"
          value={
            info.source?.ranking?.importanceRank ? 'tier-1' : 'unranked'
          }
          warn={!info.source?.ranking?.importanceRank}
        />
        <TrustRow label="источник верифиц." value="verified" />
        <TrustRow
          label="концептов"
          value={`${info.concepts?.length ?? 0} entities`}
          warn={(info.concepts?.length ?? 0) === 0}
        />
        <TrustRow label="тип" value={info.source?.dataType ?? 'news'} />
      </Panel>

      {/* AUDIO_STREAM — реальный TTS */}
      <Panel
        title="AUDIO_STREAM"
        icon={<Headphones className="w-4 h-4" />}
        badge="READY"
        badgeTone="ready"
      >
        <AudioStream text={`${info.title}. ${info.body}`} lang={info.lang} />
      </Panel>

      {/* TIP_AUTHOR — заглушка (web3, скоро) */}
      <Panel
        title="TIP_AUTHOR"
        icon={<Coins className="w-4 h-4" />}
        badge="EDD"
        badgeTone="tip"
      >
        <p className="font-tech text-xs text-slate-500 mb-3">
          поддержать автора в eddies, on-chain, мгновенно
        </p>
        <div className="flex gap-2">
          <TipButton amount={10} />
          <TipButton amount={50} />
          <TipButton amount={200} />
        </div>
      </Panel>

      {/* NEURAL_TRANSLATE — заглушка (beta) */}
      <Panel
        title="NEURAL_TRANSLATE"
        icon={<Languages className="w-4 h-4" />}
        badge="BETA"
        badgeTone="beta"
      >
        <p className="font-tech text-xs text-slate-500 mb-3">
          мгновенный перевод на 47 языков и 3 диалекта street-slang
        </p>
        <button
          type="button"
          className="w-full border border-cyberPink-500/50 text-cyberPink-500 font-orbitron text-sm tracking-[2px] py-2 hover:bg-cyberPink-500/10 transition-colors cursor-pointer"
        >
          TRANSLATE {'>'}
        </button>
      </Panel>

      {/* NET_MOOD — псевдо-настроение по статье */}
      <Panel title="NET_MOOD" icon={<Activity className="w-4 h-4" />}>
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="font-orbitron font-black text-2xl text-cyan-300">
              {mood.hype}%
            </p>
            <p className="font-tech text-[10px] text-slate-500 tracking-[1px]">
              HYPE
            </p>
          </div>
          <div>
            <p className="font-orbitron font-black text-2xl text-cyberPink-500">
              {mood.fear}%
            </p>
            <p className="font-tech text-[10px] text-slate-500 tracking-[1px]">
              FEAR
            </p>
          </div>
          <div>
            <p className="font-orbitron font-black text-2xl text-yellow-300">
              {mood.doubt}%
            </p>
            <p className="font-tech text-[10px] text-slate-500 tracking-[1px]">
              DOUBT
            </p>
          </div>
        </div>
      </Panel>
    </aside>
  );
};

export default ArticleSidebar;
