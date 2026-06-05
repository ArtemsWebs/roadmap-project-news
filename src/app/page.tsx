'use client';
import { useState } from 'react';
import fetchNews from './news/api';
import { useQuery } from 'react-query';

import styles from './cyberpunk-style.module.css';
import Header from './component/Header';
import MainBlock from './component/MainBlock';
import { NewsApiResponse, NewsApiSuccessResponse } from './news/types';

export default function Home() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['news', page],
    queryFn: () => fetchNews(page),
    keepPreviousData: true,
  });

  return (
    <div className={styles['cp-root']}>
      <div className={styles['cp-scanlines']}></div>
      <Header
        data={data as NewsApiResponse}
        isLoading={isLoading}
        error={error as Error | null}
      />
      <MainBlock
        data={data as NewsApiSuccessResponse}
        isLoading={isLoading}
        error={error as Error | null}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
