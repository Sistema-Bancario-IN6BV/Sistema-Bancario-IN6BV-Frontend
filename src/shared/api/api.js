import axios from "axios";
import { clearPersistedAuth, getPersistedAuthToken } from "../store/authStorage";

const axiosAuth = axios.create({
    baseURL: import.meta.env.VITE_AUTH_URL || import.meta.env.VITE_API_AUTH_URL || "http://localhost:5127/api/v1",
    timeout: 8000,
    headers: {
        "Content-Type": "application/json"
    }
});

const axiosAdmin = axios.create({
    baseURL: import.meta.env.VITE_ADMIN_URL || import.meta.env.VITE_API_BANK_URL || "http://localhost:3006/bankSystem/v1",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
});

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

// Interceptor de respuesta para manejar errores y facilitar debug
const handleAuthError = (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401) {
        clearPersistedAuth();
        try { if (typeof window !== 'undefined') delete window.__AUTH_TOKEN__; } catch {}
        window.location.href = "/";
    }

    // Log server errors to help debugging 500s (frontend-side only)
    if (status >= 500) {
        try {
            // Avoid printing full token
            console.error('[API][ServerError]', { url, status, response: error.response?.data });
        } catch (e) {
            console.error('[API][ServerError] failed to log error', e);
        }
    }

    return Promise.reject(error);
};

axiosAuth.interceptors.response.use((response) => response, handleAuthError);
axiosAdmin.interceptors.response.use((response) => response, handleAuthError);

export { axiosAuth, axiosAdmin };
