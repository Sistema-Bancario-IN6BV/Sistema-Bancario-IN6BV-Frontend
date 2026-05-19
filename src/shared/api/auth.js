import { axiosAuth } from "./api";

export const login = async (data) => {
    return await axiosAuth.post("/auth/login", data);
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

export const getProfile = async () => {
    const { data } = await axiosAuth.get("/auth/profile");
    return { profile: data };
};

export const updateProfile = async (formData) => {
    // Use postForm so axios sets correct multipart/form-data headers
    return await axiosAuth.postForm("/auth/profile", formData);
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
