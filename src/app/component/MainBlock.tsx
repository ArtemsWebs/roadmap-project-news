'use client';

import {
  NewsApiResponse,
  NewsApiSuccessResponse,
  isNewsApiSuccess,
} from '../news/types';
import SearchBlock from './SearchBlock';
import FastFilterBlock from './FastFilter/FastFilterBlock';
import { NewsBlock } from '../news/view/NewsBlock';
import ActiveFilters from '../news/filters/ActiveFilters';
import FiltersDrawer from '../news/filters/FiltersDrawer';
import EmptyState from '../news/view/EmptyState';
import { CyberLoader } from '@/components/ui/CyberLoader';
import { sortLabel, useFiltersStore } from '../news/filters/model';

interface MainBlockProps {
  data?: NewsApiResponse;
  isLoading: boolean;
  error: Error | null;
  page: number;
  onPageChange: (page: number) => void;
}

const MainBlock = ({
  data,
  isLoading,
  error,
  page,
  onPageChange,
}: MainBlockProps) => {
  const sortBy = useFiltersStore((s) => s.filters.sortBy);

  const success = !!data && isNewsApiSuccess(data);
  const totalResults = success
    ? (data as NewsApiSuccessResponse).articles.totalResults
    : 0;
  const isErrored = !!error || (!!data && !success);
  const apiError =
    !error && !!data && !success ? (data as { error: string }).error : null;

  const status: 'ok' | 'error' | 'not_found' | 'other' = isLoading
    ? 'other'
    : isErrored
      ? 'error'
      : totalResults === 0
        ? 'not_found'
        : 'ok';

  return (
    <div className="w-[92%] md:w-[85%] lg:w-[70%] mx-auto min-h-[calc(100vh-319px)]">
      <div
        className="flex flex-col justify-center items-center border border-cyan-300/60 p-3 sm:p-5 relative my-6 md:my-11"
        style={{ background: 'rgba(15, 12, 36, 0.78)' }}
      >
        <div
          className="absolute left-1 top-1 w-full h-full pointer-events-none"
          style={{
            background:
              'linear-gradient(173deg, rgba(0, 0, 0, 0.00) 40%, rgba(0, 240, 255, 0.08) 50%, rgba(0, 0, 0, 0.00) 60%)',
          }}
        />
        <SearchBlock />

        {/* Быстрые фильтры (статус/итог/сортировка) + активные чипсы */}
        <div className="w-full border-t border-cyan-300/40 p-4 flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
          <FastFilterBlock
            sortBy={sortLabel(sortBy)}
            totalResults={totalResults}
            status={status}
            isLoading={isLoading}
          />
          <div className="lg:max-w-[62%]">
            <ActiveFilters />
          </div>
        </div>
      </div>

      {/* Контент: лоадер / ошибка / пусто / новости */}
      {isLoading ? (
        <CyberLoader />
      ) : isErrored ? (
        <EmptyState
          title="SIGNAL_LOST"
          message={
            apiError ?? error?.message ?? 'ошибка соединения с источником.'
          }
        />
      ) : totalResults === 0 ? (
        <EmptyState />
      ) : (
        <NewsBlock
          articles={(data as NewsApiSuccessResponse).articles}
          page={page}
          onPageChange={onPageChange}
        />
      )}

      <FiltersDrawer />
    </div>
  );
};

export default MainBlock;
