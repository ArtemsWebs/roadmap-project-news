'use client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { initLocationSync } from './component/location/syncLocationToFilters';

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState<QueryClient>(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // не перезапрашивать при возврате фокуса в окно/вкладку
            refetchOnWindowFocus: false,
            // и при восстановлении соединения
            refetchOnReconnect: false,
            // данные свежи 5 минут — нет лишних рефетчей при ремаунте
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  // Подписка locationStore → filtersStore. Регистрируем один раз на клиенте,
  // отписываемся при размонтировании.
  useEffect(() => {
    const unsubscribe = initLocationSync();
    return unsubscribe;
  }, []);

  return (
    <NextIntlClientProvider locale={'en'}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NextIntlClientProvider>
  );
};

export default Providers;
