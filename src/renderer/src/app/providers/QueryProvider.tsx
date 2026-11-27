import {
  useState,
  type PropsWithChildren,
  type ReactElement,
} from 'react';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

export const QueryProvider = ({
  children,
}: PropsWithChildren): ReactElement => {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
          staleTime: 30_000,
          networkMode: 'always',
        },

        mutations: {
          retry: false,
          networkMode: 'always',
        },
      },
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
