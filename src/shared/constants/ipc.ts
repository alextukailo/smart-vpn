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

  SETTINGS: {
    GET: 'settings:get',
    SET_PRIMARY_VPN: 'settings:set-primary-vpn',
    ADD_DOMAIN: 'settings:add-domain',
    UPDATE_DOMAIN: 'settings:update-domain',
    REMOVE_DOMAIN: 'settings:remove-domain',
  },

  MONITORING: {
    GET_STATE: 'monitoring:get-state',
    START: 'monitoring:start',
    STOP: 'monitoring:stop',
  },
} as const;
