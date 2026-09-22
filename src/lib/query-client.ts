import { QueryClient } from '@tanstack/react-query';

import { BackendError } from '@/lib/backend';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (failureCount >= 2) return false;
        return !(error instanceof BackendError) || error.status === undefined || error.status >= 500;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
