'use client';

import { cn } from '@/lib/utils';
import { ArasakaIcon } from '@/shared/icons/Arasaka';

interface CyberLoaderProps {
  label?: string;
  className?: string;
}

/** Киберпанк-лоадер: глитч-текст + индетерминированная неон-полоса */
export const CyberLoader = ({
  label = 'DECRYPTING_FEED',
  className,
}: CyberLoaderProps) => {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden flex flex-col items-center justify-center gap-5 py-24 px-6',
        className,
      )}
      style={{ background: 'rgba(30, 27, 56, 0.25)' }}
    >
      {/* вращающийся ромб-сканер */}
      <div className="relative w-20 h-20">
        <span className="absolute inset-0 border-2 rounded-4xl border-cyan-300/70 rotate-45 animate-spin [animation-duration:2.2s] shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
        <span className="absolute inset-[6px] border-2 rounded-2xl border-cyberPink-500/70 rotate-45 animate-spin [animation-duration:1.4s] [animation-direction:reverse]" />
        <ArasakaIcon
          width={48}
          height={48}
          className="cp-bulb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        />
      </div>

      {/* глитч-текст */}
      <div
        className="font-orbitron font-bold tracking-[3px] text-cyan-200 text-sm sm:text-base cp-glitch-text"
        data-text={label}
      >
        {label}
        <span className="cp-dots" />
      </div>

      {/* индетерминированная полоса */}
      <div className="relative w-56 max-w-[70%] h-[3px] bg-cyan-300/10 overflow-hidden">
        <span className="absolute top-0 left-0 h-full w-1/3 cp-loader-bar bg-gradient-to-r from-transparent via-cyan-300 to-fuchsia-400 shadow-[0_0_10px_#22d3ee]" />
      </div>
    </div>
  );
};

export default CyberLoader;
