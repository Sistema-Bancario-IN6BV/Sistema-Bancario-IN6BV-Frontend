import { create } from 'zustand';
import { getTransactions, getMyTransactions } from '../../../shared/api/transactions';

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  loading:      false,
  error:        null,
  isAdmin:      false,

  setIsAdmin: (isAdmin) => set({ isAdmin }),

  fetchTransactions: async (limit = 50) => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const res  = get().isAdmin
        ? await getTransactions({ limit })
        : await getMyTransactions(limit);
      const data = res.data?.transactions ?? res.data?.transaction ?? res.data ?? [];
      set({ transactions: Array.isArray(data) ? data : [] });
    } catch (err) {
      set({ error: err?.response?.data?.message || err.message || 'Error al cargar transacciones' });
    } finally {
      set({ loading: false });
    }
  },

  clearTransactions: () => set({ transactions: [], error: null }),
}));
