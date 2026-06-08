import { cn } from '@/lib/utils';

type BadgeTone = 'ai' | 'live' | 'ready' | 'beta' | 'tip' | 'mood';

const toneClasses: Record<BadgeTone, string> = {
  ai: 'text-cyberPink-500 border-cyberPink-500/60',
  beta: 'text-cyberPink-500 border-cyberPink-500/60',
  live: 'text-cyan-300 border-cyan-300/60',
  ready: 'text-emerald-300 border-emerald-300/60',
  tip: 'text-yellow-300 border-yellow-300/60',
  mood: 'text-cyan-300 border-cyan-300/60',
};

interface PanelProps {
  title: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeTone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

/** Бордерная киберпанк-панель сайдбара с заголовком и угловым бейджем */
export const Panel = ({
  title,
  icon,
  badge,
  badgeTone = 'live',
  children,
  className,
}: PanelProps) => (
  <section
    className={cn('relative border border-cyan-300/30 p-4', className)}
    style={{ background: 'rgba(10, 10, 26, 0.6)' }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 text-cyan-300">
        {icon}
        <h3 className="font-orbitron font-bold text-sm tracking-[2px]">
          {title}
        </h3>
      </div>
      {badge && (
        <span
          className={cn(
            'font-tech text-[10px] tracking-[1px] uppercase px-2 py-[1px] border',
            toneClasses[badgeTone],
          )}
        >
          {badge}
        </span>
      )}
    </div>
    {children}
  </section>
);

export default Panel;
