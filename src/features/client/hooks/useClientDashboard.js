import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { useUserManagmentStore } from '../../users/store/useUserManagmentStore';
import {
  getMyAccountRequests, getMyAccountSummary, requestAccount,
  getFavorites, addFavorite, getMyTransactions, createTransaction,
  getAccountByNumber,
} from '../../../shared/api/admin';
import { showError, showSuccess } from '../../../shared/utils/toast';
import { normalizeRole } from '../../../shared/utils/authRole';

const normalizeTxType = (type) => String(type || '').toUpperCase();

const isSameDay = (leftDate, rightDate = new Date()) => {
  if (!leftDate) return false;
  return new Date(leftDate).toDateString() === rightDate.toDateString();
};

const getAccountId = (account) => account?._id || account?.id || '';

export const useClientDashboard = () => {
  const { user }    = useAuthStore();
  const { accounts = [], loading: accountsLoading } = useAccountStore();
  const { users }   = useUserManagmentStore();

  const normalizedRole = normalizeRole(user?.role);
  const isAdmin  = normalizedRole === 'ADMIN_ROLE';
  const isClient = normalizedRole === 'USER_ROLE';

  const [accountRequests,      setAccountRequests]      = useState([]);
  const [accountSummary,       setAccountSummary]       = useState({ totalAccounts: 0, hasAnyAccount: false, hasPendingRequest: false });
  const [requesting,           setRequesting]           = useState(false);
  const [recentTransactions,   setRecentTransactions]   = useState([]);
  const [favorites,            setFavorites]            = useState([]);
  const [conversionOpen,       setConversionOpen]       = useState(false);
  const [conversionAccount,    setConversionAccount]    = useState(null);
  const [confirmOpen,          setConfirmOpen]          = useState(false);
  const [confirmPayload,       setConfirmPayload]       = useState({ from: '', to: '', amount: '' });
  const [transferLoading,      setTransferLoading]      = useState(false);
  const [lastTransferSuccess,  setLastTransferSuccess]  = useState(false);
  const [recipient,            setRecipient]            = useState('');
  const [selectedFrom,         setSelectedFrom]         = useState('');
  const [amount,               setAmount]               = useState('');
  const [showAddFavForm,       setShowAddFavForm]       = useState(false);
  const [newFavAccount,        setNewFavAccount]        = useState('');
  const [newFavAlias,          setNewFavAlias]          = useState('');

  const activeAccounts = useMemo(() => accounts.filter(a => a.status === 'ACTIVE'), [accounts]);
  const myAccounts     = useMemo(() => accounts.filter(a => String(a.externalUserId) === String(user?.id)), [accounts, user?.id]);
  const myAccountOwner = useMemo(() => users.find(u => u.uid === user?.id || u.id === user?.id), [users, user]);
  const pendingRequest = useMemo(() => accountRequests.find(r => r.status === 'PENDING'), [accountRequests]);
  const totalBalance   = useMemo(() => accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0), [accounts]);

  const todaysOutgoingTransferTotal = useMemo(() => recentTransactions.reduce((sum, t) => {
    if (normalizeTxType(t?.type) !== 'TRANSFER') return sum;
    if (!isSameDay(t?.createdAt || t?.date)) return sum;
    if (String(t?.sourceAccount?.externalUserId || '') !== String(user?.id)) return sum;
    return sum + Number(t?.amount || 0);
  }, 0), [recentTransactions, user?.id]);

  const remainingDailyTransferLimit = Math.max(10000 - todaysOutgoingTransferTotal, 0);
  const canRequestAccount = !accountSummary.hasAnyAccount && !pendingRequest;

  useEffect(() => {
    (async () => {
      try {
        const [requestsRes, summaryRes] = await Promise.all([getMyAccountRequests(), getMyAccountSummary()]);
        const requestsData = requestsRes.data?.requests ?? requestsRes.data ?? [];
        setAccountRequests(Array.isArray(requestsData) ? requestsData : []);
        setAccountSummary(summaryRes.data || { totalAccounts: 0, hasAnyAccount: false, hasPendingRequest: false });
      } catch (error) {
        showError(error?.response?.data?.message || 'No se pudieron cargar tus solicitudes');
      }
    })();

    (async () => {
      try {
        await useAccountStore.getState().getAccounts();
        const txRes = await getMyTransactions(100);
        const txs   = txRes.data?.transactions ?? txRes.data ?? [];
        setRecentTransactions(Array.isArray(txs) ? txs : []);
        try {
          const favRes = await getFavorites();
          const favs   = favRes?.data?.favorites ?? favRes?.data ?? [];
          setFavorites(Array.isArray(favs) ? favs : []);
        } catch (err) { console.warn('Failed to load favorites:', err); }
      } catch (err) { console.error('Error loading recent transactions', err); }
    })();
  }, []);  

  const performTransfer = async () => {
    try {
      setTransferLoading(true);
      const from           = confirmPayload.from || selectedFrom;
      const to             = confirmPayload.to   || recipient;
      const favoriteId     = confirmPayload.favoriteId;
      const transferAmount = Number(confirmPayload.amount || amount);
      const sourceAccount  = accounts.find(a => getAccountId(a) === String(from));

      if (!from)                                                  { showError('Selecciona la cuenta origen'); return; }
      if (!favoriteId && !to)                                     { showError('Ingresa o selecciona un destinatario'); return; }
      if (!transferAmount || transferAmount <= 0)                 { showError('Ingresa un monto válido'); return; }
      if (!sourceAccount)                                         { showError('La cuenta origen no existe'); return; }
      if (sourceAccount.status !== 'ACTIVE')                      { showError('La cuenta origen debe estar activa'); return; }
      if (transferAmount > 2000)                                  { showError('La transferencia no puede superar Q2000'); return; }
      if (transferAmount > remainingDailyTransferLimit)           { showError('Ya alcanzaste el límite diario de Q10000'); return; }
      if (Number(sourceAccount.balance || 0) < transferAmount)   { showError('No tienes saldo suficiente'); return; }

      const payload = { type: 'TRANSFER', amount: transferAmount, sourceAccount: from };
      if (favoriteId) payload.favoriteId = favoriteId;
      else            payload.destinationAccount = to;

      const res = await createTransaction(payload);
      if (res?.data?.success) {
        showSuccess('Transferencia realizada');
        try {
          const txRes = await getMyTransactions(5);
          const txs   = txRes.data?.transactions ?? txRes.data ?? [];
          setRecentTransactions(Array.isArray(txs) ? txs : []);
        } catch { /* silent */ }
        setConfirmOpen(false); setRecipient(''); setAmount(''); setSelectedFrom('');
        setConfirmPayload({ from: '', to: '', amount: '' }); setLastTransferSuccess(true);
      } else {
        showError(res?.data?.message || 'Error al realizar la transferencia');
      }
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'Error al realizar la transferencia');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleUseFavorite = (favorite) => {
    const destination    = favorite?.accountId || favorite?.account?._id || favorite?.account?.id || favorite?.account?.accountNumber || favorite?.accountNumber || '';
    const fallbackSource = myAccounts.find(a => a.status === 'ACTIVE') || activeAccounts[0];
    setRecipient(destination); setSelectedFrom(getAccountId(fallbackSource)); setAmount('');
    setConfirmPayload({ from: getAccountId(fallbackSource), to: destination, amount: '', favoriteId: favorite?._id || favorite?.id });
    setConfirmOpen(true);
  };

  const handleRequestAccount = async () => {
    try {
      setRequesting(true);
      const res = await requestAccount();
      if (res?.data?.success) {
        showSuccess('Solicitud enviada. Un administrador la revisará pronto.');
        const [requestsRes, summaryRes] = await Promise.all([getMyAccountRequests(), getMyAccountSummary()]);
        const requestsData = requestsRes.data?.requests ?? requestsRes.data ?? [];
        setAccountRequests(Array.isArray(requestsData) ? requestsData : []);
        setAccountSummary(summaryRes.data || { totalAccounts: 0, hasAnyAccount: false, hasPendingRequest: false });
      } else {
        showError(res?.data?.message || 'No se pudo enviar la solicitud');
      }
    } catch (error) {
      showError(error?.response?.data?.message || 'No se pudo enviar la solicitud');
    } finally {
      setRequesting(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!newFavAccount) { showError('Ingresa número de cuenta'); return; }
    try {
      const resolved  = await getAccountByNumber(newFavAccount);
      const accountId = resolved?.data?.account?._id || resolved?.data?._id || resolved?.data?.account?.id || resolved?.data?.id;
      if (!accountId) { showError('No se pudo resolver la cuenta para favoritos'); return; }
      const res     = await addFavorite({ accountId, alias: newFavAlias });
      const created = res?.data?.favorite ?? res?.data ?? null;
      if (created) setFavorites(prev => [created, ...prev]);
      setNewFavAccount(''); setNewFavAlias(''); setShowAddFavForm(false);
      showSuccess('Favorito agregado');
    } catch (err) {
      showError(err?.response?.data?.message || 'Error al agregar favorito');
    }
  };

  return {
    user, accounts, users, accountsLoading, isAdmin, isClient,
    accountRequests, accountSummary, requesting,
    recentTransactions, favorites, setFavorites,
    conversionOpen, setConversionOpen, conversionAccount, setConversionAccount,
    confirmOpen, setConfirmOpen, confirmPayload, setConfirmPayload,
    transferLoading, lastTransferSuccess, setLastTransferSuccess,
    recipient, setRecipient, selectedFrom, setSelectedFrom,
    amount, setAmount, showAddFavForm, setShowAddFavForm,
    newFavAccount, setNewFavAccount, newFavAlias, setNewFavAlias,
    activeAccounts, myAccounts, myAccountOwner, pendingRequest,
    totalBalance, remainingDailyTransferLimit, canRequestAccount,
    getAccountId, normalizeTxType,
    performTransfer, handleUseFavorite, handleRequestAccount, handleAddFavorite,
  };
};
