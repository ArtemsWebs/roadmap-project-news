'use client';

import { useState } from 'react';
import CyberButton from '@/components/ui/CyberButton';
import CyberSearch from '@/components/ui/CyberSearch';
import { FilterIcon } from 'lucide-react';
import { countActiveFilters, useFiltersStore } from '../news/filters/model';
import { useLocationStore } from './location/locationStore';
import { useStatsStore } from '../profile/statsStore';

const SearchBlock = () => {
  const keyword = useFiltersStore((s) => s.filters.keyword);
  const filters = useFiltersStore((s) => s.filters);
  const patchFilters = useFiltersStore((s) => s.patchFilters);
  const openDrawer = useFiltersStore((s) => s.openDrawer);
  const location = useLocationStore((s) => s.location);
  const addSearch = useStatsStore((s) => s.addSearch);

  const [value, setValue] = useState(keyword);
  // Синхронизация локального ввода с внешним keyword (напр. после сброса чипса)
  // через паттерн «корректировка стейта при рендере», без useEffect.
  const [prevKeyword, setPrevKeyword] = useState(keyword);
  if (keyword !== prevKeyword) {
    setPrevKeyword(keyword);
    setValue(keyword);
  }

  const activeCount = countActiveFilters(filters, location);

  const commit = () => {
    if (value !== keyword) {
      patchFilters({ keyword: value, page: 1 });
      if (value.trim()) addSearch();
    }
  };

  return (
    <div className="w-full p-2 sm:p-4 relative">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 sm:gap-4 mb-4">
        <CyberSearch
          placeholder="Search"
          className="w-full"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
          }}
        />
        <CyberButton onClick={openDrawer}>
          <div className="flex items-center justify-center gap-2">
            <FilterIcon className="w-4 h-4" />
            <span className="text-sm font-orbitron font-bold text-[#00F0FF] tracking-widest uppercase">
              Filters
            </span>
            {activeCount > 0 && (
              <span className="ml-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[11px] font-tech text-[#0a0a1a] bg-cyberPink-500 shadow-[0_0_8px_rgba(255,43,214,0.6)]">
                {activeCount}
              </span>
            )}
          </div>
        </CyberButton>
      </div>
    </div>
  );
};

export default SearchBlock;
