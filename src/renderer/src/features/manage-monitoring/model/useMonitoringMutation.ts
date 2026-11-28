import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  monitoringApi,
  monitoringKeys,
} from '@renderer/entities/monitoring';

type MonitoringAction =
  | 'start'
  | 'stop';

export const useMonitoringMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [
      ...monitoringKeys.all,
      'operation',
    ],

    scope: {
      id: 'monitoring-mutations',
    },

    mutationFn: (action: MonitoringAction) => {
      return action === 'start'
        ? monitoringApi.start()
        : monitoringApi.stop();
    },

    retry: false,

    onSuccess: async (state) => {
      await queryClient.cancelQueries({
        queryKey: monitoringKeys.state(),
      });

      queryClient.setQueryData(
        monitoringKeys.state(),
        state,
      );
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: monitoringKeys.state(),
      });
    },
  });
};
