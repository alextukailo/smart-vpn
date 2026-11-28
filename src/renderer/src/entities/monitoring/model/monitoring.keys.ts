export const monitoringKeys = {
  all: ['monitoring'] as const,

  state: () => [
    ...monitoringKeys.all,
    'state',
  ] as const,
};
