import { useQuery } from '@tanstack/react-query';

import { vpnApi } from '../api/vpn.api';
import { vpnKeys } from './vpn.keys';

const REFRESH_INTERVAL = 2_000;

export const useVpnConnections = () => {
  return useQuery({
    queryKey: vpnKeys.list(),
    queryFn: vpnApi.list,

    staleTime: 1_000,
    refetchInterval: REFRESH_INTERVAL,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: false,
  });
};
