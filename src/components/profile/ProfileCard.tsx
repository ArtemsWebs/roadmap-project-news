'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from 'react-query';
import { LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMe } from '@/app/profile/useMe';
import { useStatsStore } from '@/app/profile/statsStore';
import { logout } from '@/app/auth/api';

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center px-2">
    <span className="font-orbitron font-black text-sm text-cyan-300 leading-none">
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
  const reactions = useStatsStore((s) => s.reactions);
  const ttsListens = useStatsStore((s) => s.ttsListens);
  const readCount = useStatsStore((s) => s.readArticles.length);

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
        'relative p-[2px] bg-gradient-to-br from-[#CFFF04] via-[#FF2BD6] to-[#00F0FF] shadow-[0_0_14px_rgba(255,43,214,0.25)]',
        width,
      )}
    >
      <div className="relative flex items-center gap-3 p-3 bg-[#05060f]">
        <Link href="/profile" className="shrink-0">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-10 h-10 object-cover border border-[#00F0FF] shadow-[0_0_8px_#00F0FF66]"
            />
          ) : (
            <div className="w-10 h-10 border border-cyan-300/40 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-cyan-300/60" />
            </div>
          )}
        </Link>

        <Link href="/profile" className="min-w-0 flex-1">
          <p className="font-orbitron text-sm text-cyan-300 truncate hover:text-cyan-100 transition-colors">
            {user.username}
          </p>
          <p className="font-tech text-[10px] text-cyan-300/40 truncate">
            {user.email}
          </p>
        </Link>

        <div className="hidden sm:flex items-center border-l border-cyan-300/20 pl-2">
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
