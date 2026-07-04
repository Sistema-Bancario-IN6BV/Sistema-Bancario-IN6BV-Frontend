import { create } from 'zustand';
import { getProducts } from '../../../shared/api/products';

export const useProductStore = create((set, get) => ({
  products: [],
  loading:  false,
  error:    null,

  fetchProducts: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const response   = await getProducts();
      let productsData = response.data?.products || response.data?.data || response.data || [];
      if (!Array.isArray(productsData) && typeof productsData === 'object')
        productsData = Object.values(productsData);
      const normalized = (Array.isArray(productsData) ? productsData : []).map(p => {
        const raw = p?.isActive;
        const isActiveBool = typeof raw === 'boolean' ? raw
          : typeof raw === 'string'  ? raw === 'true' || raw === '1'
          : typeof raw === 'number'  ? raw === 1 : !!raw;
        return { ...p, isActive: isActiveBool };
      });
      set({ products: normalized });
    } catch (err) {
      set({ error: err?.response?.data?.message || err.message || 'Error al cargar productos' });
    } finally {
      set({ loading: false });
    }
  },

  setProducts: (products) => set({ products }),
  clearProducts: () => set({ products: [], error: null }),
}));
