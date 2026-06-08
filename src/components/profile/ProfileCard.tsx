'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from 'react-query';
import { LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMe } from '@/app/profile/useMe';
import { useStatsStore, netrunnerLevel } from '@/app/profile/statsStore';
import { logout } from '@/app/auth/api';
import CyberFrame from './CyberFrame';

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center px-2.5">
    <span className="font-orbitron font-black text-sm text-[#FFE600] leading-none">
      {value}
    </span>
    <span className="font-tech text-[9px] tracking-widest text-cyan-300/50 uppercase">
      {label}
    </span>
  </div>
);

export const ProfileCard = ({
  variant = 'header',
}: {
  variant?: 'header' | 'sidebar';
}) => {
  const { user, isLoading } = useMe();
  const router = useRouter();
  const qc = useQueryClient();
  const readArticles = useStatsStore((s) => s.readArticles);
  const reactions = useStatsStore((s) => s.reactions);
  const ttsListens = useStatsStore((s) => s.ttsListens);
  const searches = useStatsStore((s) => s.searches);
  const readCount = readArticles.length;
  const { level } = netrunnerLevel({
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

  const width =
    variant === 'sidebar' ? 'w-full' : 'w-[300px] max-w-[70vw]';

  if (isLoading) {
    return (
      <div
        className={cn(
          'relative border border-cyan-300/30 bg-black/50 p-3',
          width,
        )}
      >
        <span className="font-tech text-xs text-cyan-300/50">
          LOADING IDENTITY…
        </span>
      </div>
    );
  }

  // Гость
  if (!user) {
    return (
      <div
        className={cn(
          'relative border border-cyan-300/40 bg-black/50 p-3 flex items-center justify-between gap-3',
          width,
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 border border-cyan-300/30 flex items-center justify-center shrink-0">
            <UserIcon className="w-4 h-4 text-cyan-300/50" />
          </div>
          <div className="min-w-0">
            <p className="font-orbitron text-xs text-cyan-300 truncate">GUEST</p>
            <p className="font-tech text-[10px] text-cyan-300/40 truncate">
              not authenticated
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push('/auth')}
          className="shrink-0 font-orbitron text-[11px] tracking-widest uppercase text-[#00F0FF] border border-[#00F0FF] px-3 py-2 hover:shadow-[0_0_10px_#00F0FF66] transition-all cursor-pointer"
        >
          Jack in
        </button>
      </div>
    );
  }

  // Авторизован
  return (
    <div
      className={cn(
        'group relative text-[#FFE600] drop-shadow-[0_0_10px_rgba(255,230,0,0.22)] transition-[filter] duration-300 hover:drop-shadow-[0_0_16px_rgba(255,230,0,0.45)]',
        width,
      )}
    >
      <div className="absolute inset-[3px] bg-[#05060f]" />
      {/* лёгкие сканлайны внутри */}
      <div
        className="absolute inset-[3px] opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #00F0FF 0px, #00F0FF 1px, transparent 1px, transparent 3px)',
        }}
      />
      <CyberFrame className="absolute inset-0 h-full w-full pointer-events-none" />

      <div className="relative flex items-center gap-3 px-4 py-3">
        <Link href="/profile" className="relative shrink-0">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-11 h-11 object-cover border border-[#00F0FF] shadow-[0_0_8px_#00F0FF66] transition-shadow group-hover:shadow-[0_0_14px_#00F0FF]"
            />
          ) : (
            <div className="w-11 h-11 border border-cyan-300/40 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-cyan-300/60" />
            </div>
          )}
          {/* онлайн-индикатор */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border border-[#05060f] shadow-[0_0_6px_#34d399] animate-pulse" />
        </Link>

        <Link href="/profile" className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="font-orbitron text-sm text-cyan-300 truncate group-hover:text-cyan-100 transition-colors">
              {user.username}
            </p>
            <span className="shrink-0 font-tech text-[8px] leading-[14px] tracking-widest text-[#FFE600] border border-[#FFE600]/50 px-1">
              LVL {level}
            </span>
          </div>
          <p className="font-tech text-[10px] text-cyan-300/40 truncate">
            {user.email}
          </p>
        </Link>

        <div className="hidden sm:flex items-center divide-x divide-cyan-300/15 border-l border-cyan-300/20 pl-1">
          <Metric label="read" value={readCount} />
          <Metric label="react" value={reactions} />
          <Metric label="tts" value={ttsListens} />
        </div>

        <button
          type="button"
          onClick={onLogout}
          title="Logout"
          className="shrink-0 text-cyan-300/50 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
