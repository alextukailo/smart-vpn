import { useQuery } from '@tanstack/react-query';

import { monitoringApi } from '../api/monitoring.api';
import { monitoringKeys } from './monitoring.keys';

const REFRESH_INTERVAL = 1_000;

export const useMonitoringState = () => {
  return useQuery({
    queryKey: monitoringKeys.state(),
    queryFn: monitoringApi.getState,

    staleTime: 0,

    refetchInterval: (query) => {
      return query.state.data?.status === 'stopped'
        ? false
        : REFRESH_INTERVAL;
    },

    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: false,
  });
};
