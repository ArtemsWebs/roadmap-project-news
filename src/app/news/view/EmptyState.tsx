'use client';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title?: string;
  message?: string;
  className?: string;
}

/** Заглушка «нет данных» в киберпанк-стиле (NO_SIGNAL) */
export const EmptyState = ({
  title = 'NO_SIGNAL',
  message = 'запрос не вернул результатов. отрегулируйте фильтры.',
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden flex flex-col items-center justify-center text-center py-20 px-6',
        className,
      )}
      style={{ background: 'rgba(30, 27, 56, 0.35)' }}
    >
      {/* косая скан-полоса */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'linear-gradient(100deg, transparent 30%, rgba(34,211,238,0.10) 48%, rgba(34,211,238,0.25) 50%, rgba(34,211,238,0.10) 52%, transparent 70%)',
        }}
      />
      <h3
        className="relative font-orbitron font-black text-3xl sm:text-4xl tracking-[3px] text-cyberPink-500"
        style={{
          textShadow:
            '0 0 12px rgba(255,43,214,0.6), 2px 0 0 rgba(0,240,255,0.5), -2px 0 0 rgba(255,43,214,0.5)',
        }}
      >
        {title}
      </h3>
      <p className="relative mt-3 font-tech text-sm tracking-[1px] text-slate-400">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;
