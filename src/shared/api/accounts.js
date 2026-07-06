import { axiosAdmin } from './api';

export const getAccounts = async () => axiosAdmin.get('/accounts/me');

export const getAccountById = async (accountId) => {
  if (!accountId) throw new Error('getAccountById: accountId required');
  return axiosAdmin.get(`/accounts/${accountId}`);
};

export const getAccountByNumber = async (accountNumber) => {
  if (!accountNumber) throw new Error('getAccountByNumber: accountNumber required');
  return axiosAdmin.get(`/accounts/lookup/${encodeURIComponent(String(accountNumber).trim())}`);
};

export const createAccount    = async (data)               => axiosAdmin.post('/accounts/create', data);
export const updateAccount    = async (accountId, data)    => axiosAdmin.put(`/accounts/update/${accountId}`, data);
export const deleteAccount    = async (accountId)          => axiosAdmin.delete(`/accounts/delete/${accountId}`);
export const requestAccount   = async ()                   => axiosAdmin.post('/accounts/requests');
export const getMyAccountRequests = async ()               => axiosAdmin.get('/accounts/requests/me');
export const getMyAccountSummary  = async ()               => axiosAdmin.get('/accounts/me/summary');
export const getAccountRequests   = async ()               => axiosAdmin.get('/accounts/requests');

export const approveAccountRequest = async (requestId) =>
  axiosAdmin.post(`/accounts/requests/${requestId}/approve`);

export const rejectAccountRequest = async (requestId, reviewNote = '') =>
  axiosAdmin.post(`/accounts/requests/${requestId}/reject`, { reviewNote });

export const convertAccountBalance = async (accountId, to) => {
  if (!accountId) throw new Error('accountId required');
  return axiosAdmin.get(`/accounts/convert-balance/${accountId}`, { params: { to } });
};
