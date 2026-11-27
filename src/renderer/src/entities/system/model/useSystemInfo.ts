import { useQuery } from '@tanstack/react-query';

import { getSystemInfo } from '../api/system.api';

export const useSystemInfo = () => {
  return useQuery({
    queryKey: ['system', 'info'],
    queryFn: getSystemInfo,
    staleTime: Infinity,
  });
};
