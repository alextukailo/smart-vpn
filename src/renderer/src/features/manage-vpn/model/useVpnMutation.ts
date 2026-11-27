import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  vpnApi,
  vpnKeys,
} from '@renderer/entities/vpn';

type VpnAction =
  | 'connect'
  | 'disconnect';

interface VpnMutationParams {
  id: string;
  action: VpnAction;
}

export const useVpnMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['vpn', 'operation'],

    mutationFn: ({
      id,
      action,
    }: VpnMutationParams) => {
      return action === 'connect'
        ? vpnApi.connect(id)
        : vpnApi.disconnect(id);
    },

    retry: false,

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: vpnKeys.all,
      });
    },
  });
};
