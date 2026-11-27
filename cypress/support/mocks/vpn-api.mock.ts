
import {
  type SmartVpnApi,
  type VpnConnection,
} from '@shared/types';

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
): SmartVpnApi => {
  let connections = structuredClone(initialConnections);

  const getConnection = (id: string): VpnConnection => {
    const connection = connections.find(
      (item) => item.id === id,
    );

    if (!connection) {
      throw new Error('VPN connection not found');
    }

    return connection;
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
  };
};
