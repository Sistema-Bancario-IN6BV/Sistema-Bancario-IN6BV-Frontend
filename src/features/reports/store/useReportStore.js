import { create } from 'zustand';
import { getTransactions } from '../../../shared/api/transactions';

export const useReportStore = create((set, get) => ({
  transactions: [],
  loading:      false,
  error:        null,

  fetchReportData: async (limit = 100) => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const res  = await getTransactions({ limit });
      const data = res.data?.transactions ?? res.data?.transaction ?? res.data ?? [];
      set({ transactions: Array.isArray(data) ? data : [] });
    } catch (err) {
      set({ error: err?.response?.data?.message || err.message || 'Error al cargar reportes' });
    } finally {
      set({ loading: false });
    }
  },

  clearReports: () => set({ transactions: [], error: null }),
}));
