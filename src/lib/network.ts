/**
 * MediQueue Network & Mobile QR Configuration
 * Provides dynamic network resolution so mobile devices scanning QR codes over LAN/Wi-Fi
 * reach the host machine rather than failing on localhost.
 */

// Host Wi-Fi IP address detected from Windows network adapter
export const DEFAULT_WIFI_IP = '192.168.0.236';
export const DEFAULT_HOTSPOT_IP = '192.168.137.1';
export const DEFAULT_PORT = '3000';

export const KNOWN_NETWORK_IPS = [
  { label: 'Wi-Fi Network (192.168.0.236)', ip: '192.168.0.236' },
  { label: 'Mobile Hotspot', ip: DEFAULT_HOTSPOT_IP },
];

/**
 * Returns the currently active host IP or origin for mobile QR redirection.
 */
export function getMobileBaseUrl(): string {
  if (typeof window === 'undefined') {
    return `http://${DEFAULT_WIFI_IP}:${DEFAULT_PORT}`;
  }

  const hostname = window.location.hostname;

  // If accessed via LAN IP or custom domain, use current origin
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return window.location.origin;
  }

  // Check if user set a custom IP preference in localStorage
  const savedIp = localStorage.getItem('mediqueue_lan_ip');
  const targetIp = savedIp || DEFAULT_WIFI_IP;

  return `http://${targetIp}:${window.location.port || DEFAULT_PORT}`;
}

export interface TokenMetadata {
  name?: string;
  doc?: string;
  dept?: string;
  room?: string;
  pos?: number;
  wait?: number;
}

/**
 * Returns the full scannable URL for mobile patient token creation or claim.
 * Encodes token metadata into query parameters so phone browsers immediately reconstruct
 * the active pass even across disparate client-side localStorage domains.
 */
export function getMobileTokenUrl(
  tokenNumber?: string, 
  action: 'get-token' | 'claim' = 'get-token',
  meta?: TokenMetadata
): string {
  const baseUrl = getMobileBaseUrl();
  if (tokenNumber) {
    const params = new URLSearchParams();
    params.set('token', tokenNumber);
    if (meta?.name) params.set('name', meta.name);
    if (meta?.doc) params.set('doc', meta.doc);
    if (meta?.dept) params.set('dept', meta.dept);
    if (meta?.room) params.set('room', meta.room);
    if (meta?.pos !== undefined) params.set('pos', String(meta.pos));
    if (meta?.wait !== undefined) params.set('wait', String(meta.wait));
    return `${baseUrl}/patient?${params.toString()}`;
  }
  return `${baseUrl}/patient?action=${action}`;
}

/**
 * Saves custom LAN IP in localStorage.
 */
export function setCustomLanIp(ip: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mediqueue_lan_ip', ip.trim());
  }
}

/**
 * Gets saved custom LAN IP from localStorage if present.
 */
export function getSavedLanIp(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mediqueue_lan_ip') || DEFAULT_WIFI_IP;
  }
  return DEFAULT_WIFI_IP;
}
