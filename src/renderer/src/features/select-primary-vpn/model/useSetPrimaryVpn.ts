import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  settingsApi,
  settingsKeys,
} from '@renderer/entities/settings';

export const useSetPrimaryVpn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [
      ...settingsKeys.all,
      'primary-vpn',
    ],

    scope: {
      id: 'settings-mutations',
    },

    mutationFn: settingsApi.setPrimaryVpn,

    retry: false,

    onSuccess: (settings) => {
      queryClient.setQueryData(
        settingsKeys.detail(),
        settings,
      );
    },
  });
};
