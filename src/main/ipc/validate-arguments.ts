const containsControlCharacters = (
  value: string,
): boolean => {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);

    return code <= 31 || code === 127;
  });
};

export const validateVpnId = (
  value: unknown,
): string => {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > 256 ||
    value.trim() !== value ||
    containsControlCharacters(value)
  ) {
    throw new Error('Invalid VPN identifier');
  }

  return value;
};
