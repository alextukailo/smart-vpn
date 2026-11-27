import {
  type AppSettings,
  type CreateDomainRuleInput,
  type UpdateDomainRuleInput,
} from '@shared/types';

export const settingsApi = {
  get: (): Promise<AppSettings> => {
    return window.api.settings.get();
  },

  setPrimaryVpn: (
    id: string | null,
  ): Promise<AppSettings> => {
    return window.api.settings.setPrimaryVpn(id);
  },

  addDomain: (
    input: CreateDomainRuleInput,
  ): Promise<AppSettings> => {
    return window.api.settings.addDomain(input);
  },

  updateDomain: (
    input: UpdateDomainRuleInput,
  ): Promise<AppSettings> => {
    return window.api.settings.updateDomain(input);
  },

  removeDomain: (
    id: string,
  ): Promise<AppSettings> => {
    return window.api.settings.removeDomain(id);
  },
};
