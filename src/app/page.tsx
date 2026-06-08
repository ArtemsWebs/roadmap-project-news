'use client';
import fetchNews from './news/api';
import { useQuery } from 'react-query';

import styles from './cyberpunk-style.module.css';
import Header from './component/Header';
import MainBlock from './component/MainBlock';
import Footer from './component/Footer';
import { NewsApiResponse } from './news/types';
import { useFiltersStore } from './news/filters/model';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useLocationStore } from './component/location/locationStore';
import { getGeolocation } from './component/location/api';

export default function Home() {
  const filters = useFiltersStore((s) => s.filters);
  const patchFilters = useFiltersStore((s) => s.patchFilters);

  const { data, isFetching, error } = useQuery({
    queryKey: ['news', filters],
    queryFn: () => fetchNews(filters),
    keepPreviousData: true,
  });

  const { setLocation } = useLocationStore();

  useEffect(() => {
    getGeolocation().then((location) => {
      setLocation(location);
    });
  }, []);

  return (
    <div className={cn(styles['cp-root'], 'h-screen')}>
      <div className={styles['cp-scanlines']} />
      <Header
        data={data as NewsApiResponse}
        isLoading={isFetching}
        error={error as Error | null}
      />
      <MainBlock
        data={data as NewsApiResponse}
        isLoading={isFetching}
        error={error as Error | null}
        page={filters.page}
        onPageChange={(p) => patchFilters({ page: p })}
      />
      <Footer />
    </div>
  );
}
