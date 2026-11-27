export const IPC_CHANNELS = {
  SYSTEM: {
    GET_INFO: 'system:get-info',
  },

  VPN: {
    LIST: 'vpn:list',
    GET_STATUS: 'vpn:get-status',
    CONNECT: 'vpn:connect',
    DISCONNECT: 'vpn:disconnect',
  },
} as const;
