
import {
  type SmartVpnApi,
  type VpnConnection,
  type AppSettings,
} from '@shared/types';

import {
  createDefaultSettings,
} from '@shared/lib/settings';

import { normalizeDomain } from '@shared/lib/domain';

import {
  createMonitoringMock,
} from './monitoring-api.mock';

const DEFAULT_CONNECTIONS: VpnConnection[] = [
  {
    id: 'vpn-1',
    name: 'Urban VPN Desktop',
    protocol: 'VPN:com.urban-vpn.mac',
    status: 'connected',
    enabled: true,
  },
  {
    id: 'vpn-2',
    name: 'VPN JD',
    protocol: 'PPP:L2TP',
    status: 'disconnected',
    enabled: true,
  },
  {
    id: 'vpn-3',
    name: 'nazwa.pl',
    protocol: 'VPN:com.wireguard.macos',
    status: 'disconnected',
    enabled: true,
  },
  {
    id: 'vpn-4',
    name: 'Hetzner VPN',
    protocol: 'PPP:L2TP',
    status: 'disconnected',
    enabled: true,
  },
];

export const createMockApi = (
  initialConnections = DEFAULT_CONNECTIONS,
  initialSettings = createDefaultSettings(),
): SmartVpnApi => {
  let connections = structuredClone(initialConnections);
  let settings: AppSettings = structuredClone(initialSettings);
  let domainCounter = 0;

  const getConnection = (id: string): VpnConnection => {
    const connection = connections.find(
      (item) => item.id === id,
    );

    if (!connection) {
      throw new Error('VPN connection not found');
    }

    return connection;
  };

  const getNormalizedDomain = (
    value: string,
  ): string => {
    let domain: string | null | undefined;

    try {
      domain = normalizeDomain(value);
    } catch {
      throw new Error('Invalid domain or URL');
    }

    if (!domain) {
      throw new Error('Invalid domain or URL');
    }

    return domain;
  };

  return {
    system: {
      getInfo: () => Promise.resolve({
        platform: 'darwin',
        architecture: 'arm64',
        supported: true,
        appVersion: '1.0.0',
      }),
    },

    vpn: {
      list: () => Promise.resolve(
        structuredClone(connections),
      ),

      getStatus: async (id) => {
        return getConnection(id).status;
      },

      connect: async (id) => {
        const connection = getConnection(id);

        if (
          connections.some(
            (item) =>
              item.id !== id &&
              item.status === 'connected',
          )
        ) {
          throw new Error('Another VPN is active');
        }

        const changed =
          connection.status !== 'connected';

        connections = connections.map((item) => (
          item.id === id
            ? {
              ...item,
              status: 'connected',
            }
            : item
        ));

        return {
          id,
          status: 'connected',
          changed,
        };
      },

      disconnect: async (id) => {
        const connection = getConnection(id);

        const changed =
          connection.status !== 'disconnected';

        connections = connections.map((item) => (
          item.id === id
            ? {
              ...item,
              status: 'disconnected',
            }
            : item
        ));

        return {
          id,
          status: 'disconnected',
          changed,
        };
      },
    },

    settings: {
      get: () => Promise.resolve(
        structuredClone(settings),
      ),

      setPrimaryVpn: async (id) => {
        if (id !== null) {
          const connection = getConnection(id);

          if (!connection.enabled) {
            throw new Error('VPN connection is disabled');
          }
        }

        settings = {
          ...settings,

          primaryVpnId: id,

          automation: {
            ...settings.automation,

            enabled:
              id !== null &&
              id === settings.primaryVpnId &&
              settings.automation.enabled,
          },
        };

        return structuredClone(settings);
      },

      addDomain: async (input) => {
        const domain = getNormalizedDomain(
          input.domain,
        );

        if (
          settings.domains.some(
            (rule) => rule.domain === domain,
          )
        ) {
          throw new Error('This domain already exists');
        }

        let id: string;

        do {
          domainCounter += 1;
          id = `mock-domain-${domainCounter}`;
        } while (
          settings.domains.some(
            (rule) => rule.id === id,
          )
        );

        settings = {
          ...settings,

          domains: [
            ...settings.domains,
            {
              id,
              domain,
              enabled: true,
              includeSubdomains: input.includeSubdomains,
            },
          ],
        };

        return structuredClone(settings);
      },

      updateDomain: async (input) => {
        const exists = settings.domains.some(
          (rule) => rule.id === input.id,
        );

        if (!exists) {
          throw new Error('Domain rule not found');
        }

        const domain = getNormalizedDomain(
          input.domain,
        );

        if (
          settings.domains.some(
            (rule) =>
              rule.domain === domain &&
              rule.id !== input.id,
          )
        ) {
          throw new Error('This domain already exists');
        }

        settings = {
          ...settings,

          domains: settings.domains.map((rule) => (
            rule.id === input.id
              ? {
                ...input,
                domain,
              }
              : rule
          )),
        };

        return structuredClone(settings);
      },

      removeDomain: async (id) => {
        if (
          !settings.domains.some(
            (rule) => rule.id === id,
          )
        ) {
          throw new Error('Domain rule not found');
        }

        settings = {
          ...settings,

          domains: settings.domains.filter(
            (rule) => rule.id !== id,
          ),
        };

        return structuredClone(settings);
      },
    },

    monitoring: createMonitoringMock(),
  };
};
