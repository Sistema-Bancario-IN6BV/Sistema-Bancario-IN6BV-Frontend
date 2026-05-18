import { axiosAdmin } from './api';

export const getProducts = async () => {
	return axiosAdmin.get('/products');
};

export const getProductById = async (id) => {
	return axiosAdmin.get(`/products/${id}`);
};

export const createProduct = async (productData) => {
	return axiosAdmin.post('/products/create', productData);
};

export const updateProduct = async (id, productData) => {
	return axiosAdmin.put(`/products/update/${id}`, productData);
};

export const deleteProduct = async (id) => {
	return axiosAdmin.delete(`/products/delete/${id}`);
};

export const activateProduct = async (id) => {
	return axiosAdmin.put(`/products/activate/${id}`);
};

export const deactivateProduct = async (id) => {
	return axiosAdmin.put(`/products/deactivate/${id}`);
};
