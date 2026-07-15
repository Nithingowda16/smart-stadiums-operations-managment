// Determine production/development backend URLs
export const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

export const WS_BASE = (import.meta as any).env?.VITE_WS_URL || (
  window.location.protocol === 'https:'
    ? `wss://${window.location.host}`
    : `ws://${window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname}:8000`
);
