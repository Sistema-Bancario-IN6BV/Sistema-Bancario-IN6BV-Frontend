import { axiosAdmin } from './api';

export const getUsersAdmin  = async ()     => axiosAdmin.get('/users');
export const getUserByIdAdmin = async (id) => axiosAdmin.get(`/users/${id}`);
export const deleteUserAdmin  = async (id) => axiosAdmin.delete(`/users/${id}`);
