// Constantes de configuracion de la capa API (baseURLs, timeouts, rutas de fallback)
// Centraliza valores que antes estaban hardcodeados dentro de shared/api/api.js

export const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_URL || import.meta.env.VITE_API_AUTH_URL || 'http://localhost:5127/api/v1';

export const ADMIN_BASE_URL =
  import.meta.env.VITE_ADMIN_URL || import.meta.env.VITE_API_BANK_URL || 'http://localhost:3006/bankSystem/v1';

export const AUTH_REQUEST_TIMEOUT_MS = 8000;
export const ADMIN_REQUEST_TIMEOUT_MS = 10000;

export const LOGIN_ROUTE = '/';
