'use client';

import { useEffect, useState } from 'react';
import {
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  SlidersHorizontal,
  XIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DATA_TYPE_OPTIONS,
  DEFAULT_FILTERS,
  KEYWORD_LOC_OPTIONS,
  LANGUAGES,
  NewsFilters,
  SORT_OPTIONS,
  useFiltersStore,
} from './model';
import {
  CyberInput,
  CyberRadioRow,
  CyberToggle,
  FieldLabel,
} from './CyberControls';
import { useLocationStore } from '@/app/component/location/locationStore';

const MAX_QUERY = 500;

export const FiltersDrawer = () => {
  const { filters, isDrawerOpen, applyFilters, resetFilters, closeDrawer } =
    useFiltersStore();

  const { location } = useLocationStore();

  const [draft, setDraft] = useState<NewsFilters>(filters);

  // При каждом ОТКРЫТИИ синхронизируем черновик с применёнными фильтрами.
  // Паттерн «корректировка стейта при рендере» вместо useEffect.
  const [wasOpen, setWasOpen] = useState(isDrawerOpen);
  if (isDrawerOpen !== wasOpen) {
    setWasOpen(isDrawerOpen);
    if (isDrawerOpen) setDraft(filters);
  }

  // Esc закрывает
  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDrawer();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDrawerOpen, closeDrawer]);

  // Блокируем скролл и прячем скроллбар основной страницы, пока drawer открыт
  useEffect(() => {
    if (!isDrawerOpen) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = prevOverflow;
    };
  }, [isDrawerOpen]);

  const patch = (p: Partial<NewsFilters>) => setDraft((d) => ({ ...d, ...p }));

  const toggleLang = (code: string) =>
    patch({
      lang: draft.lang.includes(code)
        ? draft.lang.filter((l) => l !== code)
        : [...draft.lang, code],
    });

  const toggleDataType = (value: NewsFilters['dataType'][number]) =>
    patch({
      dataType: draft.dataType.includes(value)
        ? draft.dataType.filter((d) => d !== value)
        : [...draft.dataType, value],
    });

  const handleApply = () => {
    applyFilters(draft);
    closeDrawer();
  };

  const handleReset = () => {
    setDraft(DEFAULT_FILTERS);
    resetFilters();
  };

  return (
    <>
      {/* Затемнение */}
      <div
        onClick={closeDrawer}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300',
          isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Панель */}
      <aside
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full sm:w-[460px] max-w-full',
          'flex flex-col border-l border-cyan-300/40',
          'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ background: 'rgba(8, 8, 22, 0.97)' }}
        role="dialog"
        aria-label="Query params"
      >
        {/* Хедер */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-300/30 shrink-0">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-cyan-300" />
            <h2 className="font-orbitron font-black text-lg tracking-[2px] text-cyan-100">
              QUERY_PARAMS
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Тело со скроллом */}
        <div className="cp-scroll flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
          {/* Q // QUERY */}
          <div>
            <FieldLabel hint={'"exact", +must, -exclude, AND/OR/NOT'}>
              Q // QUERY
            </FieldLabel>
            <CyberInput
              textarea
              rows={3}
              maxLength={MAX_QUERY}
              value={draft.keyword}
              onChange={(e) => patch({ keyword: e.target.value })}
              placeholder="crypto AND (ethereum OR litecoin) NOT bitcoin"
            />
            <div className="flex items-center justify-between mt-1">
              <div className="flex gap-2">
                {(['and', 'or'] as const).map((op) => (
                  <CyberToggle
                    key={op}
                    active={draft.keywordOper === op}
                    onClick={() => patch({ keywordOper: op })}
                  >
                    {op}
                  </CyberToggle>
                ))}
              </div>
              <span className="font-tech text-[10px] text-slate-500">
                {draft.keyword.length}/{MAX_QUERY}
              </span>
            </div>
          </div>

          {/* SEARCH IN (keywordLoc) */}
          <div>
            <FieldLabel>SEARCH_IN</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {KEYWORD_LOC_OPTIONS.map((o) => (
                <CyberToggle
                  key={o.value}
                  active={draft.keywordLoc === o.value}
                  onClick={() => patch({ keywordLoc: o.value })}
                >
                  {o.label}
                </CyberToggle>
              ))}
            </div>
          </div>

          {/* SOURCES (sourceUri) */}
          <div>
            <FieldLabel hint="domain1,domain2 (max 20)">SOURCES</FieldLabel>
            <CyberInput
              value={draft.sourceUri}
              onChange={(e) => patch({ sourceUri: e.target.value })}
              placeholder="bbc.com,techcrunch.com"
            />
          </div>

          {/* EXCLUDE SOURCES / EXCLUDE KEYWORD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="domain">EXCLUDE_SRC</FieldLabel>
              <CyberInput
                value={draft.ignoreSourceUri}
                onChange={(e) => patch({ ignoreSourceUri: e.target.value })}
                placeholder="example.com"
              />
            </div>
            <div>
              <FieldLabel>EXCLUDE_KEYWORD</FieldLabel>
              <CyberInput
                value={draft.ignoreKeyword}
                onChange={(e) => patch({ ignoreKeyword: e.target.value })}
                placeholder="spam"
              />
            </div>
          </div>

          {/* FROM / TO (dateStart/dateEnd) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>FROM</FieldLabel>
              <CyberInput
                type="date"
                value={draft.dateStart}
                onChange={(e) => patch({ dateStart: e.target.value })}
                className="[color-scheme:dark]"
              />
            </div>
            <div>
              <FieldLabel>TO</FieldLabel>
              <CyberInput
                type="date"
                value={draft.dateEnd}
                onChange={(e) => patch({ dateEnd: e.target.value })}
                className="[color-scheme:dark]"
              />
            </div>
          </div>

          {/* LANGUAGE (lang[]) */}
          <div>
            <FieldLabel hint="ISO-639-3">LANGUAGE</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <CyberToggle
                  key={l.code}
                  active={draft.lang.includes(l.code)}
                  onClick={() => toggleLang(l.code)}
                >
                  {l.label}
                </CyberToggle>
              ))}
            </div>
          </div>

          {/* DATA_TYPE (dataType[]) */}
          <div>
            <FieldLabel>DATA_TYPE</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {DATA_TYPE_OPTIONS.map((o) => (
                <CyberToggle
                  key={o.value}
                  active={draft.dataType.includes(o.value)}
                  onClick={() => toggleDataType(o.value)}
                >
                  {o.label}
                </CyberToggle>
              ))}
            </div>
          </div>

          {/* SORT_BY (articlesSortBy) */}
          <div>
            <FieldLabel>SORT_BY</FieldLabel>
            <div className="flex flex-col gap-2">
              {SORT_OPTIONS.map((o) => (
                <CyberRadioRow
                  key={o.value}
                  active={draft.sortBy === o.value}
                  onClick={() => patch({ sortBy: o.value })}
                >
                  {o.label}
                </CyberRadioRow>
              ))}
            </div>
          </div>

          {/* SKIP DUPLICATES (isDuplicateFilter) */}
          <div>
            <FieldLabel>DEDUP</FieldLabel>
            <CyberToggle
              active={draft.skipDuplicates}
              onClick={() => patch({ skipDuplicates: !draft.skipDuplicates })}
            >
              skip_duplicates {draft.skipDuplicates ? 'ON' : 'OFF'}
            </CyberToggle>
          </div>

          {/* PAGE_SIZE (articlesCount) */}
          <div>
            <FieldLabel>PAGE_SIZE: {draft.pageSize}</FieldLabel>
            <input
              type="range"
              min={1}
              max={100}
              value={draft.pageSize}
              onChange={(e) => patch({ pageSize: Number(e.target.value) })}
              className="cp-range w-full"
              style={{
                background: `linear-gradient(90deg, #00F0FF 0%, #FF2BD6 ${draft.pageSize}%, rgba(148,163,184,0.25) ${draft.pageSize}%)`,
              }}
            />
          </div>

          {/* PAGE (articlesPage) */}
          <div>
            <FieldLabel>PAGE</FieldLabel>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => patch({ page: Math.max(1, draft.page - 1) })}
                className="w-10 h-10 flex items-center justify-center border border-cyan-300/40 text-cyan-300 hover:bg-cyan-300/10 transition-colors cursor-pointer"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <CyberInput
                type="number"
                min={1}
                value={draft.page}
                onChange={(e) =>
                  patch({ page: Math.max(1, Number(e.target.value) || 1) })
                }
                className="text-center w-24"
              />
              <button
                type="button"
                onClick={() => patch({ page: draft.page + 1 })}
                className="w-10 h-10 flex items-center justify-center border border-cyan-300/40 text-cyan-300 hover:bg-cyan-300/10 transition-colors cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Футер */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-cyan-300/30 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-3 border border-slate-600 text-slate-300 hover:border-cyan-300/60 hover:text-cyan-200 transition-colors cursor-pointer font-orbitron text-sm tracking-[1px]"
          >
            <RotateCcwIcon className="w-4 h-4" />
            RESET
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="group relative flex-1 px-4 py-3 font-orbitron font-bold text-[#00F0FF] tracking-[2px] uppercase text-sm cursor-pointer overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#0a2a2a] to-[#1a0a2e] transition-all duration-300 group-hover:from-[#00F0FF]/20 group-hover:to-[#7C3AED]/30" />
            <span className="absolute inset-0 border border-[#00F0FF] transition-all duration-300 group-hover:shadow-[0_0_12px_#00F0FF,inset_0_0_12px_#00F0FF22]" />
            <span className="relative">APPLY_FILTERS {'>>'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default FiltersDrawer;
