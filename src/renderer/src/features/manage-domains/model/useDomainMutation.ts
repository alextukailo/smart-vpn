
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  type CreateDomainRuleInput,
  type UpdateDomainRuleInput,
} from '@shared/types';

import {
  settingsApi,
  settingsKeys,
} from '@renderer/entities/settings';

type DomainMutationParams =
  | {
    action: 'add';
    input: CreateDomainRuleInput;
  }
  | {
    action: 'update';
    input: UpdateDomainRuleInput;
  }
  | {
    action: 'remove';
    id: string;
  };

export const useDomainMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [
      ...settingsKeys.all,
      'domain-operation',
    ],

    scope: {
      id: 'settings-mutations',
    },

    mutationFn: (params: DomainMutationParams) => {
      switch (params.action) {
        case 'add':
          return settingsApi.addDomain(params.input);

        case 'update':
          return settingsApi.updateDomain(params.input);

        case 'remove':
          return settingsApi.removeDomain(params.id);
      }
    },

    retry: false,

    onSuccess: (settings) => {
      queryClient.setQueryData(
        settingsKeys.detail(),
        settings,
      );
    },
  });
};
