import axios from "axios";
import { useAuthStore } from "../../features/auth/store/authStore";

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

// Interceptor para axiosAuth
axiosAuth.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para axiosAdmin
axiosAdmin.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de respuesta para manejar errores 401
const handleAuthError = (error) => {
    if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = "/";
    }
    return Promise.reject(error);
};

axiosAuth.interceptors.response.use((response) => response, handleAuthError);
axiosAdmin.interceptors.response.use((response) => response, handleAuthError);

export { axiosAuth, axiosAdmin };
