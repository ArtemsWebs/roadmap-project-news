'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from 'react-query';
import { ArrowLeft, LogOut, User as UserIcon } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import styles from '../cyberpunk-style.module.css';
import tiles from './profile.module.css';
import MatrixRain from '../auth/MatrixRain';
import { useMe } from './useMe';
import { useStatsStore, netrunnerLevel } from './statsStore';
import { useNewsStore } from '../news/newsStore';
import { logout } from '../auth/api';

const Tile = ({ label, value }: { label: string; value: string | number }) => (
  <div className={tiles.tile}>
    <span className="font-orbitron font-black text-3xl text-cyan-300 leading-none">
      {value}
    </span>
    <span className="font-tech text-[10px] tracking-widest text-cyan-300/50 uppercase">
      {label}
    </span>
  </div>
);

export default function ProfilePage() {
  const { user, isLoading } = useMe();
  const router = useRouter();
  const qc = useQueryClient();

  const readArticles = useStatsStore((s) => s.readArticles);
  const reactions = useStatsStore((s) => s.reactions);
  const ttsListens = useStatsStore((s) => s.ttsListens);
  const searches = useStatsStore((s) => s.searches);
  const feedSize = useNewsStore((s) => s.totalResults);

  const { level, rank } = netrunnerLevel({
    readArticles,
    reactions,
    ttsListens,
    searches,
  });

  const onLogout = async () => {
    await logout();
    await qc.invalidateQueries(['me']);
    router.push('/');
  };

  return (
    <div className={cn(styles['cp-root'], 'min-h-screen p-4 md:p-8')}>
      <MatrixRain />
      <div className={styles['cp-scanlines']} />

      <div className="relative z-[2] max-w-[980px] mx-auto flex flex-col gap-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-tech text-xs tracking-widest uppercase text-cyan-300 hover:text-cyan-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {'<< back_to_feed'}
        </Link>

        {isLoading ? (
          <p className="font-tech text-cyan-300/60">LOADING IDENTITY…</p>
        ) : !user ? (
          <div className="border border-rose-400 bg-black/60 p-8 flex flex-col items-start gap-4">
            <p className="font-orbitron text-xl text-rose-400">ACCESS DENIED</p>
            <p className="font-tech text-sm text-cyan-300/60">
              {'// требуется авторизация для доступа к профилю'}
            </p>
            <button
              type="button"
              onClick={() => router.push('/auth')}
              className="font-orbitron text-sm tracking-widest uppercase text-[#00F0FF] border border-[#00F0FF] px-4 py-2 hover:shadow-[0_0_10px_#00F0FF66] transition-all cursor-pointer"
            >
              ▶ Jack in
            </button>
          </div>
        ) : (
          <>
            {/* Шапка профиля */}
            <div className="relative border border-cyan-300/40 bg-black/60 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <span className="absolute bottom-[-4px] right-[-4px] w-full h-full border border-[#7C3AED]/60 pointer-events-none" />
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-24 h-24 object-cover border border-[#00F0FF] shadow-[0_0_14px_#00F0FF66]"
                />
              ) : (
                <div className="w-24 h-24 border border-cyan-300/40 flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-cyan-300/50" />
                </div>
              )}
              <div className="flex flex-col gap-1 min-w-0">
                <h1 className="font-orbitron font-black text-2xl text-cyan-300">
                  {user.username}
                </h1>
                <p className="font-tech text-sm text-cyan-300/60">
                  {user.email}
                </p>
                <p className="font-tech text-[11px] text-cyan-300/40">
                  REPLICANT ID: {user.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="font-tech text-[11px] text-cyan-300/40">
                  MEMBER SINCE: {formatDate(user.createdAt)}
                </p>
                <p className="font-tech text-[11px] text-[#FF2BD6] mt-1">
                  NETRUNNER LVL {level} · {rank}
                </p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="sm:ml-auto flex items-center gap-2 font-tech text-xs tracking-widest uppercase text-cyan-300/60 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>

            {/* Дашборд */}
            <div>
              <p className="font-tech text-xs tracking-widest text-cyan-300/50 uppercase mb-2">
                {'// activity metrics'}
              </p>
              <div className={tiles.tiles}>
                <Tile label="Read Articles" value={readArticles.length} />
                <Tile label="Reactions" value={reactions} />
                <Tile label="TTS Listens" value={ttsListens} />
                <Tile label="Searches" value={searches} />
                <Tile label="Feed Size" value={feedSize} />
                <Tile label="Netrunner Lvl" value={level} />
              </div>
            </div>

            {/* ACCESS LOG */}
            <div className="border border-cyan-300/20 bg-black/60 p-4">
              <p className="font-tech text-xs tracking-widest text-cyan-300/50 uppercase mb-2">
                {'// access log · recent reads'}
              </p>
              {readArticles.length === 0 ? (
                <p className="font-tech text-xs text-cyan-300/30">NO ENTRIES</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {readArticles
                    .slice(-8)
                    .reverse()
                    .map((uri) => (
                      <li
                        key={uri}
                        className="font-tech text-[11px] text-[#7CFFB2] truncate"
                      >
                        {'> '}
                        {uri}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
