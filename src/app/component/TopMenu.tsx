'use client';
import { Dot, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Текущее время HH:MM:SS (с секундами), фиксированная локаль для стабильности */
const formatNow = () =>
  new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const TopMenu = () => {
  // Плейсхолдер одинаков на сервере и клиенте → нет hydration-mismatch.
  // Реальное время проставляется только на клиенте, в эффекте, и тикает раз в секунду.
  const [time, setTime] = useState('--:--:--');

  useEffect(() => {
    const tick = () => setTime(formatNow());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex justify-between items-center w-full px-3 md:px-6 py-2 border-b border-cyan-200 gap-2">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <Wifi className="w-4 h-4 text-cyan-400" />{' '}
          <span className="font-tech text-cyan-400 text-xs md:text-base">
            UPLINK_OK
          </span>
        </div>
        <p className="hidden sm:block font-tech text-slate-400 text-xs md:text-base truncate">
          SECTOR-7 / DUBNA_CITY
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="font-tech text-slate-400 text-xs md:text-base tabular-nums"
          suppressHydrationWarning
        >
          {time}
        </div>
        <div className="flex items-center gap-2 rounded-full">
          <Dot className="w-1 h-1 bg-fuchsia-400 rounded-full animate-ping" />
          <p className="font-tech text-fuchsia-400 animate-pulse text-xs md:text-base">
            Live
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopMenu;
