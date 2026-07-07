import { useEffect, useMemo, useState } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { useUserManagmentStore } from '../../users/store/useUserManagmentStore';
import { useAuthStore } from '../../auth/store/authStore';
import { useUIStore } from '../../../shared/store/uiStore';
import { showError, showSuccess } from '../../../shared/utils/toast';
import { normalizeRole } from '../../../shared/utils/authRole';
import { createTransaction, getAccountsWithMostMovements, getAccountByNumber } from '../../../shared/api/admin';
import { resolveAccountReference } from '../../../shared/utils/accountReference';

export const useAccounts = () => {
  const { accounts = [], loading, getAccounts, createAccount, updateAccount, deleteAccount } = useAccountStore();
  const { users = [], fetchUsers } = useUserManagmentStore();
  const { user }    = useAuthStore();
  const { openConfirm } = useUIStore();

  const normalizedRole = normalizeRole(user?.role);
  const isAdmin  = normalizedRole === 'ADMIN_ROLE';
  const isClient = normalizedRole === 'USER_ROLE';

  const [createOpen,         setCreateOpen]         = useState(false);
  const [editOpen,           setEditOpen]           = useState(false);
  const [selectedAccount,    setSelectedAccount]    = useState(null);
  const [conversionOpen,     setConversionOpen]     = useState(false);
  const [conversionAccount,  setConversionAccount]  = useState(null);
  const [depositOpen,        setDepositOpen]        = useState(false);
  const [depositDestination, setDepositDestination] = useState(null);
  const [depositLoading,     setDepositLoading]     = useState(false);
  const [orderMode,          setOrderMode]          = useState('activity-desc');
  const [movementRanking,    setMovementRanking]    = useState([]);
  const [rankingLoading,     setRankingLoading]     = useState(false);
  const [searchTerm,         setSearchTerm]         = useState('');
  const [currentPage,        setCurrentPage]        = useState(1);
  const [pageSize,           setPageSize]           = useState(6);

  useEffect(() => {
    getAccounts().catch(err => console.warn('getAccounts failed:', err));
    fetchUsers().catch(err  => console.warn('fetchUsers failed:', err));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAdmin || !orderMode.startsWith('activity')) { setMovementRanking([]); return; }
    (async () => {
      try {
        setRankingLoading(true);
        const sort = orderMode === 'activity-asc' ? 'asc' : 'desc';
        const res  = await getAccountsWithMostMovements(sort);
        const data = res?.data?.data ?? res?.data ?? [];
        setMovementRanking(Array.isArray(data) ? data : []);
      } catch { setMovementRanking([]); }
      finally  { setRankingLoading(false); }
    })();
  }, [isAdmin, orderMode]);

  const canEditSelected = useMemo(() => {
    if (!selectedAccount || !user?.id) return false;
    return isAdmin;
  }, [isAdmin, selectedAccount, user?.id]);

  const statusBadgeClass = (status) => {
    if (status === 'ACTIVE')  return 'bg-green-400/20 text-green-100 border border-green-300/30';
    if (status === 'BLOCKED') return 'bg-yellow-400/20 text-yellow-100 border border-yellow-300/30';
    if (status === 'CLOSED')  return 'bg-red-400/20 text-red-100 border border-red-300/30';
    return 'bg-red-400/20 text-red-100 border border-red-300/30';
  };

  const dashboardStats = useMemo(() => {
    const totalAccounts   = accounts.length;
    const activeAccounts  = accounts.filter(a => a.status === 'ACTIVE').length;
    const blockedAccounts = accounts.filter(a => a.status === 'BLOCKED' || a.status === 'CLOSED').length;
    const totalBalance    = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
    return { totalAccounts, activeAccounts, blockedAccounts, totalBalance };
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    const term = String(searchTerm || '').trim().toLowerCase();
    if (!term) return accounts;
    return accounts.filter(account => {
      const accNum = String(account.accountNumber ?? account.number ?? '').toLowerCase();
      if (accNum.includes(term)) return true;
      const owner = users.find(u => u.uid === account.externalUserId || u.id === account.externalUserId);
      if (owner) {
        const name = String(owner.name || owner.fullName || owner.username || owner.email || '').toLowerCase();
        if (name.includes(term)) return true;
      }
      return false;
    });
  }, [accounts, users, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(1); }, [currentPage, totalPages]);

  const paginatedAccounts = useMemo(() => {
    const movementCountById = new Map(
      movementRanking.map(item => [String(item?.account?._id || item?.account?.id || ''), Number(item?.movementCount || 0)])
    );
    const sorted = [...filteredAccounts].sort((l, r) => {
      if (orderMode === 'number-asc')    return String(l.accountNumber || '').localeCompare(String(r.accountNumber || ''));
      if (orderMode === 'number-desc')   return String(r.accountNumber || '').localeCompare(String(l.accountNumber || ''));
      if (orderMode === 'balance-asc')   return Number(l.balance || 0) - Number(r.balance || 0);
      if (orderMode === 'balance-desc')  return Number(r.balance || 0) - Number(l.balance || 0);
      const lc = movementCountById.get(String(l._id || l.id)) || 0;
      const rc = movementCountById.get(String(r._id || r.id)) || 0;
      return orderMode === 'activity-asc' ? lc - rc : rc - lc;
    });
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize).map(account => ({
      ...account,
      movementCount: movementRanking.find(item =>
        String(item?.account?._id || item?.account?.id || '') === String(account._id || account.id)
      )?.movementCount || 0,
    }));
  }, [filteredAccounts, currentPage, pageSize, movementRanking, orderMode]);

  const handleCreateSubmit = async ({ ok, payload, error }) => {
    if (!ok)      { showError(error || 'No se pudo crear la cuenta'); return; }
    if (!isAdmin) { showError('Solo administradores pueden crear cuentas'); return; }
    const res = await createAccount(payload);
    if (res?.success) { showSuccess('Cuenta creada correctamente'); setCreateOpen(false); setSelectedAccount(null); return; }
    showError(res?.error || 'Error al crear la cuenta');
  };

  const handleEditSubmit = async ({ ok, payload, error }) => {
    if (!ok)             { showError(error || 'No se pudo actualizar la cuenta'); return; }
    if (!selectedAccount){ return; }
    if (!canEditSelected){ showError('No tienes permiso para editar esta cuenta'); return; }
    const accountId = selectedAccount._id ?? selectedAccount.id;
    if (!accountId) { showError('ID de cuenta inválido'); return; }
    const res = await updateAccount(accountId, payload);
    if (res?.success) { showSuccess('Cuenta actualizada'); setEditOpen(false); setSelectedAccount(null); return; }
    showError(res?.error || 'Error al actualizar la cuenta');
  };

  const handleOpenCreate  = ()        => { setSelectedAccount(null); setCreateOpen(true); };
  const handleOpenEdit    = (account) => { setSelectedAccount(account); setEditOpen(true); };
  const handleOpenDeposit = (account) => { setDepositDestination(account); setDepositOpen(true); };

  const handleActivate = (account) => {
    const accountId = account._id ?? account.id;
    if (!accountId) { showError('ID de cuenta inválido'); return; }
    if (!isAdmin)   { showError('Solo admins pueden activar cuentas'); return; }
    openConfirm({
      title:   'Activar cuenta',
      message: 'Esta acción volverá a habilitar la cuenta con estado ACTIVE. ¿Confirmas?',
      onConfirm: async () => {
        const res = await updateAccount(accountId, { status: 'ACTIVE' });
        if (res?.success) showSuccess('Cuenta activada correctamente');
        else              showError(res?.error || 'Error al activar la cuenta');
      },
    });
  };

  const handleDeactivate = (account) => {
    const accountId = account._id ?? account.id;
    if (!accountId) { showError('ID de cuenta inválido'); return; }
    if (!isAdmin && !(user?.id && account.externalUserId === user.id)) {
      showError('No tienes permiso para desactivar esta cuenta'); return;
    }
    openConfirm({
      title:   'Desactivar cuenta',
      message: 'Esta acción desactivará la cuenta. ¿Confirmas?',
      onConfirm: async () => {
        const res = await deleteAccount(accountId);
        if (res?.success) showSuccess('Cuenta desactivada correctamente');
        else              showError(res?.error || 'Error al desactivar la cuenta');
      },
    });
  };

  const handleDepositSubmit = async ({ ok, payload, error }) => {
    if (!ok) { showError(error || 'No se pudo registrar el depósito'); return; }
    try {
      setDepositLoading(true);
      const resolvedDestination = await resolveAccountReference(
        payload?.destinationAccount, accounts, [],
        async (accountNumber) => {
          const response = await getAccountByNumber(accountNumber);
          return response?.data?.account ?? response?.data ?? null;
        }
      );
      if (!resolvedDestination.accountId) {
        showError('No se pudo resolver la cuenta destino. Verifica el número o usa un ID válido.'); return;
      }
      const res = await createTransaction({ ...payload, destinationAccount: resolvedDestination.accountId });
      if (res?.data?.success) {
        showSuccess('Depósito registrado correctamente');
        await getAccounts(); setDepositOpen(false); setDepositDestination(null);
      } else {
        showError(res?.data?.message || 'No se pudo registrar el depósito');
      }
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'No se pudo registrar el depósito');
    } finally {
      setDepositLoading(false);
    }
  };

  return {
    accounts, users, user, loading, isAdmin, isClient,
    createOpen, setCreateOpen, editOpen, setEditOpen,
    selectedAccount, setSelectedAccount,
    conversionOpen, setConversionOpen, conversionAccount, setConversionAccount,
    depositOpen, setDepositOpen, depositDestination, depositLoading,
    orderMode, setOrderMode, rankingLoading,
    searchTerm, setSearchTerm, currentPage, setCurrentPage, pageSize, setPageSize,
    canEditSelected, statusBadgeClass, dashboardStats,
    filteredAccounts, totalPages, paginatedAccounts,
    handleCreateSubmit, handleEditSubmit,
    handleOpenCreate, handleOpenEdit, handleOpenDeposit,
    handleActivate, handleDeactivate, handleDepositSubmit,
  };
};
