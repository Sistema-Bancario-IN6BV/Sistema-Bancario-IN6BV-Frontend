import { axiosAdmin } from "./api";
import { getPersistedAuthToken } from "../store/authStorage";

// CUENTAS
export const getAccounts = async () => {
    return axiosAdmin.get('/accounts/me');
};

export const getAccountById = async (accountId) => {
    if (!accountId) throw new Error("getAccountById: accountId required");
    return axiosAdmin.get(`/accounts/${accountId}`);
};

export const getAccountByNumber = async (accountNumber) => {
    if (!accountNumber) throw new Error("getAccountByNumber: accountNumber required");
    return axiosAdmin.get(`/accounts/lookup/${encodeURIComponent(String(accountNumber).trim())}`);
};

export const createAccount = async (accountData) => {
    return axiosAdmin.post('/accounts/create', accountData);
};

export const updateAccount = async (accountId, accountData) => {
    return axiosAdmin.put(`/accounts/update/${accountId}`, accountData);
};

export const deleteAccount = async (accountId) => {
    return axiosAdmin.delete(`/accounts/delete/${accountId}`);
};

export const requestAccount = async () => {
    return axiosAdmin.post('/accounts/requests');
};

export const getMyAccountRequests = async () => {
    return axiosAdmin.get('/accounts/requests/me');
};

export const getMyAccountSummary = async () => {
    return axiosAdmin.get('/accounts/me/summary');
};

export const getAccountRequests = async () => {
    return axiosAdmin.get('/accounts/requests');
};

export const approveAccountRequest = async (requestId) => {
    return axiosAdmin.post(`/accounts/requests/${requestId}/approve`);
};

export const rejectAccountRequest = async (requestId, reviewNote = '') => {
    return axiosAdmin.post(`/accounts/requests/${requestId}/reject`, { reviewNote });
};

// TRANSACCIONES
export const getTransactions = async (filters = {}) => {
    return axiosAdmin.get('/transactions/get', { params: filters });
};

export const getMyTransactions = async (limit = 5) => {
    return axiosAdmin.get('/transactions/my', { params: { limit } });
};

export const getTransactionById = async (transactionId) => {
    return axiosAdmin.get(`/transactions/${transactionId}`);
};

export const createTransaction = async (payload) => {
    try {
        const token = getPersistedAuthToken();
        console.debug('[createTransaction] payload:', payload);
        console.debug('[createTransaction] auth:', token ? `${String(token).slice(0,10)}...` : 'no-token');
    } catch (e) {
        console.debug('[createTransaction] debug logging failed', e);
    }

    return axiosAdmin.post('/transactions/create', payload);
};

export const updateTransaction = async (transactionId, payload) => {
    return axiosAdmin.put(`/transactions/update/${transactionId}`, payload);
};

export const revertTransaction = async (transactionId) => {
    return axiosAdmin.put(`/transactions/revert/${transactionId}`);
};

export const getAccountsWithMostMovements = async (sort = 'desc') => {
    return axiosAdmin.get('/transactions/accounts-with-most-movements', { params: { sort } });
};

// PRODUCTOS
export const getProducts = async () => {
    return axiosAdmin.get('/products');
};

// CONVERSION DE SALDO
export const convertAccountBalance = async (accountId, to) => {
    if (!accountId) throw new Error('accountId required');
    return axiosAdmin.get(`/accounts/convert-balance/${accountId}`, { params: { to } });
};

// FAVORITOS
export const getFavorites = async () => {
    return axiosAdmin.get('/favorites');
};

export const addFavorite = async (payload) => {
    return axiosAdmin.post('/favorites/create', payload);
};

export const updateFavorite = async (id, payload) => {
    return axiosAdmin.put(`/favorites/update/${id}`, payload);
};

export const deleteFavorite = async (id) => {
    return axiosAdmin.delete(`/favorites/delete/${id}`);
};

// USUARIOS
export const getUsers = async () => {
    return axiosAdmin.get('/users');
};

export const getUserById = async (userId) => {
    return axiosAdmin.get(`/users/${userId}`);
};

export const deleteUser = async (userId) => {
    return axiosAdmin.delete(`/users/${userId}`);
};