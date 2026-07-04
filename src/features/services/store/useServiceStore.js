import { create } from 'zustand';
import { getProducts } from '../../../shared/api/products';

export const useServiceStore = create((set, get) => ({
  services: [],
  loading:  false,
  error:    null,

  fetchServices: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const res  = await getProducts();
      const data = res?.data?.products ?? res?.data ?? [];
      const list = Array.isArray(data)
        ? data.filter(p => String(p?.type || '').toLowerCase() === 'service' || String(p?.category || '').toLowerCase() === 'service')
        : [];
      set({ services: list });
    } catch (err) {
      set({ error: err?.response?.data?.message || err.message || 'Error al cargar servicios' });
    } finally {
      set({ loading: false });
    }
  },

  setServices: (services) => set({ services }),
  clearServices: () => set({ services: [], error: null }),
}));
