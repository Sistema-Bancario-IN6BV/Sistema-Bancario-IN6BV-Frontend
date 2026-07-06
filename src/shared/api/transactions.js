import { axiosAdmin } from './api';

export const getTransactions    = async (filters = {}) => axiosAdmin.get('/transactions/get', { params: filters });
export const getMyTransactions  = async (limit = 5)   => axiosAdmin.get('/transactions/my',  { params: { limit } });
export const getTransactionById = async (id)          => axiosAdmin.get(`/transactions/${id}`);

export const createTransaction = async (payload) => axiosAdmin.post('/transactions/create', payload);

export const updateTransaction = async (id, payload) => axiosAdmin.put(`/transactions/update/${id}`, payload);
export const revertTransaction = async (id)          => axiosAdmin.put(`/transactions/revert/${id}`);

export const getAccountsWithMostMovements = async (sort = 'desc') =>
  axiosAdmin.get('/transactions/accounts-with-most-movements', { params: { sort } });

export const getTransactionReceipt = async (id) =>
  axiosAdmin.get(`/transactions/${id}/receipt`, { responseType: 'blob' });
