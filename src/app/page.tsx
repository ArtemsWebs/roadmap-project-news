'use client';
import fetchNews from './news/api';
import { useQuery } from 'react-query';

import styles from './cyberpunk-style.module.css';
import Header from './component/Header';

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
  });

  return (
    <div className={styles['cp-root']}>
      <div className={styles['cp-scanlines']}></div>
      <Header data={data} isLoading={isLoading} error={error} />
    </div>
  );
}
