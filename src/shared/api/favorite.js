import { axiosAdmin } from './api';

export const getFavorites    = async ()           => axiosAdmin.get('/favorites');
export const addFavorite     = async (payload)    => axiosAdmin.post('/favorites/create', payload);
export const updateFavorite  = async (id, payload)=> axiosAdmin.put(`/favorites/update/${id}`, payload);
export const deleteFavorite  = async (id)         => axiosAdmin.delete(`/favorites/delete/${id}`);
export const fastTransfer    = async (payload)    => axiosAdmin.post('/favorites/fastTransfer', payload);
