import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /** Data is considered fresh for 60 s — prevents unnecessary refetches */
      staleTime: 60 * 1000,
      /** Keep inactive data in memory for 5 min */
      gcTime: 5 * 60 * 1000,
      /** Don't refetch when the browser tab regains focus */
      refetchOnWindowFocus: false,
      /** Don't refetch on network reconnect — user can manually refresh */
      refetchOnReconnect: false,
      /** Retry failed requests once (default is 3) */
      retry: 1,
    },
  },
});
