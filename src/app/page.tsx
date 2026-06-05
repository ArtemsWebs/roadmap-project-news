'use client';
import fetchNews from './news/api';
import { useQuery } from 'react-query';

import styles from './cyberpunk-style.module.css';
import Header from './component/Header';
import MainBlock from './component/MainBlock';
import { NewsApiResponse, NewsApiSuccessResponse } from './news/types';
import { NewsBlock } from './news/view/NewsBlock';

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
  });

  console.log(data);

  return (
    <div className={styles['cp-root']}>
      <div className={styles['cp-scanlines']}></div>
      <Header
        data={data as NewsApiResponse}
        isLoading={isLoading}
        error={error}
      />
      <MainBlock
        data={data as NewsApiSuccessResponse}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
