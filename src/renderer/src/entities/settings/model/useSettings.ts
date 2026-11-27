import { useQuery } from '@tanstack/react-query';

import { settingsApi } from '../api/settings.api';
import { settingsKeys } from './settings.keys';

export const useSettings = () => {
  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: settingsApi.get,

    staleTime: Infinity,
    retry: false,
  });
};
