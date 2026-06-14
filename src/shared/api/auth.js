// auth.js — DOS FIXES PUNTUALES, resto idéntico al original
//
// FIX 1 — updateProfile: era postForm → debe ser putForm
//   El controller del backend declara [HttpPut("profile")].
//   POST devuelve 404/405, el frontend recibe "éxito" del interceptor
//   pero el body no se procesa → nada se guarda.
//
// FIX 2 — getProfile: el backend responde { success, message, data: {...} }
//   Se retorna { profile: data } donde data ES ese objeto completo.
//   ProfilePage.jsx espera { profile } y luego extractProfile() saca .data.
//   Ahora se retorna { profile: data.data ?? data } para que los campos
//   lleguen directos sin necesitar extracciones adicionales.

import { axiosAuth } from "./api";

export const login = async (data) => {
    const resp = await axiosAuth.post("/auth/login", data);
    try {
        if (typeof window !== 'undefined' && resp?.data?.token) {
            window.__AUTH_TOKEN__ = resp.data.token;
        }
    } catch {}
    return resp;
};

export const register = async (formData) => {
    return await axiosAuth.postForm("/auth/register", formData);
};

export const getAllUsers = async () => {
    const { data } = await axiosAuth.get("/users");
    return { users: data };
};

export const updateUserRole = async (userId, roleName) => {
    return await axiosAuth.put(`/users/${userId}/role`, { roleName });
};

export const createUserByAdmin = async (formData) => {
    return await axiosAuth.postForm("/users", formData);
};

export const updateUserByAdmin = async (userId, formData) => {
    return await axiosAuth.putForm(`/users/${userId}`, formData);
};

export const deleteUserByAdmin = async (userId) => {
    return await axiosAuth.delete(`/users/${userId}`);
};

export const getUserById = async (userId) => {
    const { data } = await axiosAuth.get(`/users/${userId}`);
    return data;
};

// FIX 2: el backend responde { success, message, data: { name, email, ... } }
// Se normaliza aquí para que ProfilePage reciba el objeto de usuario directo
export const getProfile = async () => {
    const { data } = await axiosAuth.get("/auth/profile");
    // data = { success: true, message: "...", data: { name, email, ... } }
    const profile = data?.data ?? data;
    return { profile };
};

// FIX 1: era postForm → putForm  (el controller es [HttpPut("profile")])
export const updateProfile = async (formData) => {
    return await axiosAuth.putForm("/auth/profile", formData);
};

export const verifyEmail = async (token) => {
    return await axiosAuth.post("/auth/verify-email", { token });
};

export const resendVerification = async (email) => {
    return await axiosAuth.post("/auth/resend-verification", { email });
};

export const forgotPassword = async (email) => {
    return await axiosAuth.post("/auth/forgot-password", { email });
};

export const resetPassword = async (token, newPassword) => {
    return await axiosAuth.post("/auth/reset-password", { token, newPassword });
};