// api.js — FIX: removido Content-Type hardcodeado de los defaults
// Motivo: axios.putForm() y axios.postForm() necesitan generar automáticamente
// el header "Content-Type: multipart/form-data; boundary=----XYZ" con su boundary único.
// Si "Content-Type: application/json" está en los defaults, ese header sobreescribe
// al que axios intentaba poner, el backend recibe un body sin boundary, no puede
// parsear el FormData y silenciosamente ignora todos los campos → no actualiza nada.
//
// La solución: eliminar Content-Type de los defaults. Axios lo setea solo según el método:
//   - .post()/.put() con objeto JS  → application/json       (automático)
//   - .postForm()/.putForm()        → multipart/form-data + boundary (automático)
//   - .post() con URLSearchParams   → application/x-www-form-urlencoded (automático)
//
// Todo lo demás (baseURL, timeout, interceptores, token, manejo 401/500) es idéntico al original.

import axios from "axios";
import { clearPersistedAuth, getPersistedAuthToken } from "../store/authStorage";
import {
    ADMIN_BASE_URL,
    ADMIN_REQUEST_TIMEOUT_MS,
    AUTH_BASE_URL,
    AUTH_REQUEST_TIMEOUT_MS,
    LOGIN_ROUTE,
} from "../constants/api";

const axiosAuth = axios.create({
    baseURL: AUTH_BASE_URL,
    timeout: AUTH_REQUEST_TIMEOUT_MS,
    // ✅ FIX: sin Content-Type hardcodeado — axios lo determina según el método y el body
});

const axiosAdmin = axios.create({
    baseURL: ADMIN_BASE_URL,
    timeout: ADMIN_REQUEST_TIMEOUT_MS,
    // ✅ FIX: sin Content-Type hardcodeado — axios lo determina según el método y el body
});

/* ── Token interceptor — idéntico al original ── */
const withAuthHeader = (config) => {
    const token = getPersistedAuthToken();

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
};

axiosAuth.interceptors.request.use(withAuthHeader);
axiosAdmin.interceptors.request.use(withAuthHeader);

/* ── Error interceptor — idéntico al original ── */
const handleAuthError = (error) => {
    const status = error.response?.status;
    const url    = error.config?.url;

    if (status === 401) {
        clearPersistedAuth();
        try {
            if (typeof window !== "undefined") delete window.__AUTH_TOKEN__;
        } catch (e) {
            console.warn("[API] failed to clear window auth token", e);
        }
        window.location.href = LOGIN_ROUTE;
    }

    if (status >= 500) {
        try {
            console.error("[API][ServerError]", { url, status, response: error.response?.data });
        } catch (e) {
            console.error("[API][ServerError] failed to log error", e);
        }
    }

    return Promise.reject(error);
};

axiosAuth.interceptors.response.use((r) => r, handleAuthError);
axiosAdmin.interceptors.response.use((r) => r, handleAuthError);

export { axiosAuth, axiosAdmin };