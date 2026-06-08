import { useQuery } from 'react-query';
import { fetchMe, type AuthUser } from '../auth/api';

export function useMe() {
  const { data, isLoading } = useQuery<AuthUser | null>(['me'], fetchMe, {
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return { user: data ?? null, isLoading };
}
