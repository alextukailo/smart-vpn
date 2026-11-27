export const formatVpnProtocol = (
  protocol: string,
): string => {
  const normalized = protocol.toLowerCase();

  if (normalized.includes('wireguard')) {
    return 'WireGuard';
  }

  if (normalized.includes('l2tp')) {
    return 'L2TP';
  }

  if (normalized.includes('ikev2')) {
    return 'IKEv2';
  }

  if (normalized.includes('openvpn')) {
    return 'OpenVPN';
  }

  if (normalized.startsWith('vpn:')) {
    return 'Third-party VPN';
  }

  return protocol || 'Unknown protocol';
};
