export const vpnKeys = {
  all: ['vpn'] as const,

  list: () => [
    ...vpnKeys.all,
    'list',
  ] as const,

  status: (id: string) => [
    ...vpnKeys.all,
    'status',
    id,
  ] as const,
};
