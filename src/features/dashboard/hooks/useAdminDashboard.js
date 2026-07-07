import React, { useEffect, useMemo, useState } from 'react';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { useUserManagmentStore } from '../../users/store/useUserManagmentStore';
import { getTransactions, getAccountRequests, approveAccountRequest, rejectAccountRequest } from '../../../shared/api/admin';
import { showError, showSuccess } from '../../../shared/utils/toast';
import {
  UsersIcon, BuildingLibraryIcon, CreditCardIcon,
  BanknotesIcon, ClockIcon, CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const DAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

const formatMoney = (value) =>
  `Q ${Number(value || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const aggregateByDay = (transactions = []) => {
  const totals = new Map(DAY_LABELS.map(label => [label, 0]));
  transactions.forEach(tx => {
    const date = tx?.createdAt || tx?.date || tx?.created_at;
    if (!date) return;
    const dayIndex     = new Date(date).getDay();
    const normalizedDay = dayIndex === 0 ? 6 : dayIndex - 1;
    const label        = DAY_LABELS[normalizedDay];
    totals.set(label, (totals.get(label) || 0) + Math.abs(Number(tx?.amount || 0)));
  });
  return DAY_LABELS.map(label => ({ label, value: totals.get(label) || 0 }));
};

export const useAdminDashboard = () => {
  const { accounts = [], loading: accountsLoading, getAccounts } = useAccountStore();
  const { users = [], fetchUsers, loading: usersLoading }        = useUserManagmentStore();

  const [transactions,        setTransactions]        = useState([]);
  const [accountRequests,     setAccountRequests]     = useState([]);
  const [loadingTransactions, setLoadingTransactions] = React.useState(true);
  const [loadingRequests,     setLoadingRequests]     = useState(true);

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const res  = await getTransactions({ limit: 100 });
      const data = res.data?.transactions ?? res.data?.transaction ?? res.data ?? [];
      setTransactions(Array.isArray(data) ? data : []);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const res  = await getAccountRequests();
      const data = res.data?.requests ?? res.data ?? [];
      setAccountRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error?.response?.data?.message || 'No se pudieron cargar las solicitudes');
    } finally {
      setLoadingRequests(false);
    }
  };

  const refreshAll = () => {
    getAccounts().catch(() => {});
    fetchUsers(undefined, { force: true }).catch(() => {});
    loadTransactions().catch(() => {});
    loadRequests().catch(() => {});
  };

  useEffect(() => { refreshAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dashboardStats = useMemo(() => {
    const activeAccounts    = accounts.filter(a => a.status === 'ACTIVE').length;
    const totalBalance      = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
    const totalTransactions = transactions.length;
    const todayTransactions = transactions.filter(tx => {
      const date = tx?.createdAt || tx?.date || tx?.created_at;
      return date && new Date(date).toDateString() === new Date().toDateString();
    }).length;
    return [
      { label: 'Usuarios',        value: users.length.toLocaleString('es-GT'),      icon: UsersIcon           },
      { label: 'Cuentas',         value: accounts.length.toLocaleString('es-GT'),   icon: BuildingLibraryIcon },
      { label: 'Transacciones',   value: totalTransactions.toLocaleString('es-GT'), icon: CreditCardIcon      },
      { label: 'Saldo Total',     value: formatMoney(totalBalance),                 icon: BanknotesIcon       },
      { label: 'Cuentas Activas', value: activeAccounts.toLocaleString('es-GT'),    icon: ClockIcon           },
      { label: 'Hoy',             value: todayTransactions.toLocaleString('es-GT'), icon: CalendarDaysIcon    },
    ];
  }, [accounts, transactions, users.length]);

  const dailySeries = useMemo(() => aggregateByDay(transactions), [transactions]);
  const peakValue   = Math.max(...dailySeries.map(item => item.value), 1);

  const handleApproveRequest = async (id) => {
    const res = await approveAccountRequest(id);
    if (res?.data?.success) { showSuccess('Cuenta aprobada'); refreshAll(); }
    else showError(res?.data?.message || 'No se pudo aprobar');
  };

  const handleRejectRequest = async (id) => {
    const res = await rejectAccountRequest(id);
    if (res?.data?.success) { showSuccess('Solicitud rechazada'); refreshAll(); }
    else showError(res?.data?.message || 'No se pudo rechazar');
  };

  return {
    accounts, users, transactions, accountRequests,
    accountsLoading, usersLoading, loadingTransactions, loadingRequests,
    dashboardStats, dailySeries, peakValue, formatMoney,
    refreshAll, loadRequests, handleApproveRequest, handleRejectRequest,
  };
};
