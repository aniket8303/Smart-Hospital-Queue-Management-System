/**
 * MediQueue Network & Mobile QR Configuration
 * Provides dynamic network resolution so mobile devices scanning QR codes over LAN/Wi-Fi
 * reach the host machine rather than failing on localhost.
 */

const DEFAULT_WIFI_IP = '10.20.4.229';
const DEFAULT_HOTSPOT_IP = '192.168.137.1';
const DEFAULT_PORT = '3000';

export const KNOWN_NETWORK_IPS = [
  { label: 'Wi-Fi Network (Recommended)', ip: DEFAULT_WIFI_IP },
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
  const port = window.location.port ? `:${window.location.port}` : '';

  // If already accessed via LAN IP or custom domain, use current origin
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return window.location.origin;
  }

  // Check if user set a custom IP preference in localStorage
  const savedIp = localStorage.getItem('mediqueue_lan_ip');
  const targetIp = savedIp || DEFAULT_WIFI_IP;

  return `http://${targetIp}:${window.location.port || DEFAULT_PORT}`;
}

/**
 * Returns the full scannable URL for mobile patient token creation or claim.
 */
export function getMobileTokenUrl(tokenNumber?: string, action: 'get-token' | 'claim' = 'get-token'): string {
  const baseUrl = getMobileBaseUrl();
  if (tokenNumber) {
    return `${baseUrl}/patient?token=${encodeURIComponent(tokenNumber)}`;
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
