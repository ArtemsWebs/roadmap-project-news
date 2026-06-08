'use client';

import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deriveActiveChips, useFiltersStore } from './model';
import { useLocationStore } from '@/app/component/location/locationStore';

export const ActiveFilters = () => {
  const { filters, removeFilter, resetFilters } = useFiltersStore();
  const location = useLocationStore((s) => s.location);
  const chips = deriveActiveChips(filters, location);

  if (chips.length === 0) return null;

  return (
    <div className="flex items-start gap-3 flex-wrap">
      <span className="font-tech text-xs tracking-[1px] text-slate-500 uppercase pt-[6px] shrink-0">
        active //
      </span>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => removeFilter(chip.key)}
            className={cn(
              'group flex items-center gap-2 px-2 py-[3px] border',
              'border-cyberPink-500/70 text-cyberPink-500 bg-cyberPink-500/5',
              'font-tech text-xs tracking-[1px] uppercase cursor-pointer',
              'transition-all duration-200 hover:bg-cyberPink-500/15 hover:shadow-[0_0_8px_rgba(255,43,214,0.45)]',
            )}
          >
            <span>{chip.label}</span>
            <XIcon className="w-3 h-3 opacity-70 group-hover:opacity-100" />
          </button>
        ))}
        <button
          type="button"
          onClick={resetFilters}
          className="font-tech text-xs tracking-[1px] uppercase text-slate-400 underline underline-offset-2 hover:text-cyan-300 transition-colors cursor-pointer px-1"
        >
          clear all
        </button>
      </div>
    </div>
  );
};

export default ActiveFilters;
