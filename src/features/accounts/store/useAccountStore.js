import { create } from "zustand";

import {
  getAccounts as getAccountsRequest,
  getAccountById as getAccountByIdRequest,
  createAccount as createAccountRequest,
  updateAccount as updateAccountRequest,
  deleteAccount as deleteAccountRequest,
} from "../../../shared/api/admin";
import { useAuthStore } from "../../auth/store/authStore";

export const useAccountStore = create((set, get) => ({
  accounts: [],
  loading: false,
  error: null,

  accountDetail: null,
  detailLoading: false,
  detailError: null,

  getAccounts: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getAccountsRequest();

      // Backend puede responder como arreglo directo o como { accounts: [...] }
      const accounts = Array.isArray(response?.data)
        ? response.data
        : response?.data?.accounts ?? response?.data?.account ?? [];

      set({ accounts: Array.isArray(accounts) ? accounts : [], loading: false });
      return accounts;
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Error al obtener las cuentas",
        loading: false,
      });
      throw error;
    }
  },

  getAccountById: async (accountId) => {
    if (!accountId) {
      throw new Error("getAccountById: accountId required");
    }

    try {
      set({ detailLoading: true, detailError: null });
      const response = await getAccountByIdRequest(accountId);

      // Backend puede devolver distintos shapes dependiendo de implementación.
      const account = response?.data?.account ?? response?.data?.updated ?? response?.data ?? null;

      set({ accountDetail: account, detailLoading: false });
      return account;
    } catch (error) {
      set({
        detailError: error?.response?.data?.message || "Error al obtener la cuenta",
        detailLoading: false,
      });
      throw error;
    }
  },

  createAccount: async ({ externalUserId, balance, accountNumber }) => {
    // Validación: solo administradores pueden crear cuentas (protección en frontend)
    try {
      const currentUser = useAuthStore.getState().user;
      const role = currentUser?.role;
      if (!(role === "ADMIN_ROLE" || role === "PLATFORM_ADMIN")) {
        return { success: false, error: "Solo administradores pueden crear cuentas" };
      }
    } catch (err) {
      // si falla la validación por alguna razón, no bloquear la ejecución explícitamente
       
      console.warn('createAccount validation check failed:', err);
    }
    try {
      set({ loading: true, error: null });

      const payload = {
        externalUserId,
        balance,
      };

      // optional
      if (accountNumber !== undefined && accountNumber !== null && String(accountNumber).trim() !== "") {
        payload.accountNumber = accountNumber;
      }

      const response = await createAccountRequest(payload);

      // Backend: { success, account }
      const created = response?.data?.account ?? response?.data?.created ?? response?.data ?? null;

      await get().getAccounts();
      set({ loading: false });

      return { success: true, account: created };
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Error al crear la cuenta",
        loading: false,
      });
      return { success: false, error: error?.response?.data?.message || error.message };
    }
  },

  updateAccount: async (accountId, updatedData) => {
    if (!accountId) {
      return { success: false, error: "updateAccount: accountId required" };
    }

    try {
      set({ loading: true, error: null });

      const payload = {
        ...(updatedData || {}),
      };

      const response = await updateAccountRequest(accountId, payload);

      // Backend: { success: true, updated }
      const updated = response?.data?.updated ?? response?.data?.account ?? response?.data ?? null;

      await get().getAccounts();
      set({ loading: false });

      return { success: true, account: updated };
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Error al actualizar la cuenta",
        loading: false,
      });
      return { success: false, error: error?.response?.data?.message || error.message };
    }
  },

  deleteAccount: async (accountId) => {
    if (!accountId) {
      return { success: false, error: "deleteAccount: accountId required" };
    }

    try {
      set({ loading: true, error: null });
      const response = await deleteAccountRequest(accountId);

      // Backend: { success: true, message } (cierra/desactiva)
      const message = response?.data?.message ?? "Cuenta desactivada";

      await get().getAccounts();
      set({ loading: false });

      return { success: true, message };
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Error al desactivar la cuenta",
        loading: false,
      });
      return { success: false, error: error?.response?.data?.message || error.message };
    }
  },
}))

