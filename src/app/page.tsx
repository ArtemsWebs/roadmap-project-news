'use client';
import fetchNews from "./news/api";
import { useQuery } from "react-query";
import TopMenu from "./component/TopMenu";

import styles from './cyberpunk-style.module.css';

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
  });


  return (
    <div className={styles['cp-root']}>
      <div className={styles['cp-scanlines']}></div>
      <TopMenu />
    </div>
  );
}
