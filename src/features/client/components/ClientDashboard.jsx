// ClientDashboard.jsx — REDISEÑO VISUAL ÚNICAMENTE
// Toda la lógica, estados, efectos, API calls, handlers son idénticos al original
import React, { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { useUserManagmentStore } from '../../users/store/useUserManagmentStore';
import { CreditCardItem } from '../../accounts/components/CreditCardItem';
import {
  getMyAccountRequests, getMyAccountSummary, requestAccount,
  getFavorites, addFavorite, getMyTransactions, createTransaction,
} from '../../../shared/api/admin';
import { Spinner } from '../../../shared/components/layouts/Spinner';
import ConversionModal from '../../../shared/components/ui/ConversionModal';
import { showError, showSuccess } from '../../../shared/utils/toast';
import { normalizeRole } from '../../../shared/utils/authRole';
import { parseDate, formatDateTime, formatDate } from '../../../shared/utils/date';
import {
  ArrowUpRightIcon,
  ArrowPathIcon,
  ClockIcon,
  CreditCardIcon,
  BanknotesIcon,
  PlusCircleIcon,
  BoltIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

/* ── Helpers — idénticos al original ── */
const statusBadgeClass = (status) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':  return "bg-emerald-400/20 text-emerald-100 border border-emerald-300/30";
    case 'BLOCKED': return "bg-yellow-400/20 text-yellow-100 border border-yellow-300/30";
    case 'CLOSED':  return "bg-rose-400/20 text-rose-100 border border-rose-300/30";
    default:        return "bg-slate-400/20 text-slate-100 border border-slate-300/30";
  }
};

const normalizeTxType = (type) => String(type || '').toUpperCase();

const isSameDay = (leftDate, rightDate = new Date()) => {
  if (!leftDate) return false;
  const ld = parseDate(leftDate);
  const rd = rightDate instanceof Date ? rightDate : parseDate(rightDate);
  if (!ld || !rd) return false;
  return ld.toDateString() === rd.toDateString();
};

const getAccountId = (account) => account?._id || account?.id || '';

/* ── Design tokens ── */
const glass = {
  base: {
    borderRadius:   '16px',
    background:     'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border:         '1px solid rgba(255,255,255,0.09)',
    boxShadow:      '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
  },
  dark: {
    borderRadius:   '16px',
    background:     'linear-gradient(180deg, rgba(10,37,64,0.95) 0%, rgba(15,55,110,0.90) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border:         '1px solid rgba(79,142,247,0.2)',
    boxShadow:      '0 20px 60px rgba(10,37,64,0.6), inset 0 1px 0 rgba(79,142,247,0.12)',
  },
};

const labelStyle = {
  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em',
  textTransform: 'uppercase', color: 'rgba(232,240,254,0.4)', marginBottom: '6px',
};

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px',
  color: '#e8f0fe', fontSize: '0.875rem',
  outline: 'none', fontFamily: 'inherit',
};

/* ══════════════════════════════════════════════
   ClientDashboard — lógica 100% original
   ══════════════════════════════════════════════ */
export const ClientDashboard = () => {
  const { user }    = useAuthStore();
  const { accounts = [], loading: accountsLoading } = useAccountStore();
  const { users }   = useUserManagmentStore();
  const [accountRequests, setAccountRequests]     = useState([]);
  const [accountSummary, setAccountSummary]       = useState({ totalAccounts: 0, hasAnyAccount: false, hasPendingRequest: false });
  const [requesting, setRequesting]               = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [favorites, setFavorites]                 = useState([]);
  const [conversionOpen, setConversionOpen]       = useState(false);
  const [conversionAccount, setConversionAccount] = useState(null);
  const [confirmOpen, setConfirmOpen]             = useState(false);
  const [confirmPayload, setConfirmPayload]       = useState({ from: '', to: '', amount: '' });
  const [transferLoading, setTransferLoading]     = useState(false);
  const [lastTransferSuccess, setLastTransferSuccess] = useState(false);
  const [recipient, setRecipient]                 = useState('');
  const [selectedFrom, setSelectedFrom]           = useState('');
  const [amount, setAmount]                       = useState('');
  const [showAddFavForm, setShowAddFavForm]       = useState(false);
  const [newFavAccount, setNewFavAccount]         = useState('');
  const [newFavAlias, setNewFavAlias]             = useState('');

  const normalizedRole = normalizeRole(user?.role);
  const isAdmin  = normalizedRole === 'ADMIN_ROLE';
  const isClient = normalizedRole === 'USER_ROLE';

  const activeAccounts = useMemo(() => accounts.filter((a) => a.status === 'ACTIVE'), [accounts]);
  const myAccounts     = useMemo(() => accounts.filter((a) => String(a.externalUserId) === String(user?.id)), [accounts, user?.id]);

  const todaysOutgoingTransferTotal = useMemo(() => {
    return recentTransactions.reduce((sum, t) => {
      const type      = normalizeTxType(t?.type);
      const createdAt = t?.createdAt || t?.date;
      const srcUserId = String(t?.sourceAccount?.externalUserId || '');
      if (type !== 'TRANSFER') return sum;
      if (!isSameDay(createdAt)) return sum;
      if (srcUserId !== String(user?.id)) return sum;
      return sum + Number(t?.amount || 0);
    }, 0);
  }, [recentTransactions, user?.id]);

  const remainingDailyTransferLimit = Math.max(10000 - todaysOutgoingTransferTotal, 0);

  const myAccountOwner = useMemo(() => users.find(u => u.uid === user?.id || u.id === user?.id), [users, user]);
  const pendingRequest  = useMemo(() => accountRequests.find((r) => r.status === 'PENDING'), [accountRequests]);
  const totalBalance    = useMemo(() => accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0), [accounts]);

  /* ── Effects — idénticos al original ── */
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const [requestsRes, summaryRes] = await Promise.all([getMyAccountRequests(), getMyAccountSummary()]);
        const requestsData = requestsRes.data?.requests ?? requestsRes.data ?? [];
        setAccountRequests(Array.isArray(requestsData) ? requestsData : []);
        setAccountSummary(summaryRes.data || { totalAccounts: 0, hasAnyAccount: false, hasPendingRequest: false });
      } catch (error) {
        showError(error?.response?.data?.message || 'No se pudieron cargar tus solicitudes');
      }
    };
    loadRequests().catch(() => {});

    const loadMisc = async () => {
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
    };
    loadMisc().catch(() => {});
  }, []);

  /* ── performTransfer — idéntico al original ── */
  const performTransfer = async () => {
    try {
      setTransferLoading(true);
      const from           = confirmPayload.from || selectedFrom;
      const to             = confirmPayload.to   || recipient;
      const favoriteId     = confirmPayload.favoriteId;
      const transferAmount = Number(confirmPayload.amount || amount);
      const sourceAccount  = accounts.find((a) => getAccountId(a) === String(from));

      if (!from) { showError('Selecciona la cuenta origen'); return; }
      if (!favoriteId && !to) { showError('Ingresa o selecciona un destinatario'); return; }
      if (!transferAmount || transferAmount <= 0) { showError('Ingresa un monto válido'); return; }
      if (!sourceAccount) { showError('La cuenta origen no existe'); return; }
      if (sourceAccount.status !== 'ACTIVE') { showError('La cuenta origen debe estar activa'); return; }
      if (transferAmount > 2000) { showError('La transferencia no puede superar Q2000'); return; }
      if (transferAmount > remainingDailyTransferLimit) { showError('Ya alcanzaste el límite diario de Q10000'); return; }
      if (Number(sourceAccount.balance || 0) < transferAmount) { showError('No tienes saldo suficiente'); return; }

      const payload = { type: 'TRANSFER', amount: transferAmount, sourceAccount: from };
      if (favoriteId) {
        payload.favoriteId = favoriteId;
      } else {
        payload.destinationAccount = to;
      }

      const res = await createTransaction(payload);
      if (res?.data?.success) {
        showSuccess('Transferencia realizada');
        try {
          const txRes = await getMyTransactions(5);
          const txs   = txRes.data?.transactions ?? txRes.data ?? [];
          setRecentTransactions(Array.isArray(txs) ? txs : []);
        } catch (err) { console.warn('getMyTransactions failed:', err); }
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

  const canRequestAccount = !accountSummary.hasAnyAccount && !pendingRequest;

  const handleUseFavorite = (favorite) => {
    const destination   = favorite?.accountId || favorite?.account?._id || favorite?.account?.id || favorite?.account?.accountNumber || favorite?.accountNumber || '';
    const fallbackSource = myAccounts.find((a) => a.status === 'ACTIVE') || activeAccounts[0];
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

  /* ── Shared section title style ── */
  const secTitle = {
    fontFamily: '"DM Serif Display", Georgia, serif',
    fontSize: '1rem', fontWeight: 400, color: '#e8f0fe',
    display: 'flex', alignItems: 'center', gap: '8px', margin: 0,
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'clamp(16px,3vw,32px)',
      background: 'radial-gradient(ellipse 60% 45% at 5% 0%, rgba(79,142,247,0.09) 0%, transparent 55%), radial-gradient(ellipse 45% 35% at 95% 100%, rgba(0,212,160,0.07) 0%, transparent 50%), var(--dash-bg, #070d1a)',
    }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>

        {/* ══ Welcome Header ══ */}
        <header style={{
          display: 'flex', flexWrap: 'wrap', gap: '20px',
          alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '28px',
        }}>
          <div>
            <h1 style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 400,
              color: '#e8f0fe', letterSpacing: '-0.02em', marginBottom: '6px',
            }}>
              Hola, <span style={{ color: '#4f8ef7' }}>{user?.name || 'Usuario'}</span> 👋
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(232,240,254,0.42)', lineHeight: 1.6 }}>
              Bienvenido de nuevo a tu banca en línea. Aquí tienes un resumen de tu estado financiero.
            </p>
          </div>

          {/* Total balance chip */}
          <div style={{
            ...glass.base, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <div>
              <p style={labelStyle}>Saldo Total Consolidado</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#e8f0fe', letterSpacing: '-0.02em' }}>
                Q {totalBalance.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg,#4f8ef7,#2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(79,142,247,0.35)',
            }}>
              <BanknotesIcon style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 340px' }}>

          {/* ══ LEFT COLUMN ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

            {/* Account Cards */}
            <section style={{ ...glass.base, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={secTitle}>
                  <CreditCardIcon style={{ width: '20px', height: '20px', color: '#4f8ef7' }} />
                  Tus Cuentas
                </h2>
                <button style={{
                  fontSize: '0.72rem', fontWeight: 600, color: '#4f8ef7',
                  background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em',
                }}>
                  Ver todas
                </button>
              </div>

              <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
                {accountsLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '180px' }}>
                    <Spinner />
                  </div>
                ) : accounts.length === 0 ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '100%', height: '160px', borderRadius: '12px',
                    border: '2px dashed rgba(255,255,255,0.1)',
                    color: 'rgba(232,240,254,0.3)', fontSize: '0.875rem',
                  }}>
                    No tienes cuentas activas.
                  </div>
                ) : (
                  accounts.map(acc => (
                    <div key={acc._id || acc.id} style={{ flexShrink: 0 }}>
                      <CreditCardItem account={acc} accountOwner={myAccountOwner} statusBadgeClass={statusBadgeClass} />
                      {(isAdmin || (isClient && acc.externalUserId === user?.id)) && (
                        <button
                          style={{
                            marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', borderRadius: '9px', fontSize: '0.78rem', fontWeight: 600,
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(232,240,254,0.7)', cursor: 'pointer', transition: 'all 0.18s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.15)'; e.currentTarget.style.color = '#a5c8ff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(232,240,254,0.7)'; }}
                          onClick={() => { setConversionAccount(acc._id || acc.id); setConversionOpen(true); }}
                        >
                          <BanknotesIcon style={{ width: '14px', height: '14px' }} />
                          Cambio divisas
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Quick Actions */}
            <section style={{ ...glass.base, padding: '24px' }}>
              <h2 style={{ ...secTitle, marginBottom: '16px' }}>
                <BoltIcon style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
                Acceso Rápido
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '12px' }}>
                <QuickActionCard icon={ArrowPathIcon} label="Transferir"      color="linear-gradient(135deg,#4f8ef7,#2563eb)" glow="rgba(79,142,247,0.35)" />
                <QuickActionCard icon={BanknotesIcon} label="Pago Servicios" color="linear-gradient(135deg,#00d4a0,#059669)" glow="rgba(0,212,160,0.3)" />
                <QuickActionCard
                  icon={PlusCircleIcon}
                  label={pendingRequest ? 'Solicitud enviada' : 'Solicitar Cuenta'}
                  color={pendingRequest ? 'linear-gradient(135deg,#475569,#334155)' : 'linear-gradient(135deg,#a78bfa,#7c3aed)'}
                  glow={pendingRequest ? 'rgba(71,85,105,0.2)' : 'rgba(167,139,250,0.3)'}
                  onClick={handleRequestAccount}
                  disabled={!canRequestAccount || requesting}
                />
              </div>
            </section>

            {/* Financial Insights */}
            <section style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>

              {/* Spend chart */}
              <div style={{ ...glass.base, padding: '24px' }}>
                <h3 style={{ ...secTitle, marginBottom: '20px' }}>
                  <ChartBarIcon style={{ width: '18px', height: '18px', color: '#4f8ef7' }} />
                  Análisis de Gastos
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', height: '120px' }}>
                  {[40, 70, 45, 90, 65, 30, 50].map((h, i) => (
                    <div key={i} style={{ position: 'relative', flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                      <div
                        style={{
                          width: '100%', height: `${h}%`,
                          borderRadius: '5px 5px 2px 2px',
                          background: `linear-gradient(180deg, rgba(79,142,247,${0.4 + h/200}) 0%, rgba(79,142,247,0.2) 100%)`,
                          border: '1px solid rgba(79,142,247,0.25)',
                          transition: 'all 0.2s',
                          cursor: 'default',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'linear-gradient(180deg,#4f8ef7,rgba(0,212,160,0.6))';
                          e.currentTarget.style.boxShadow  = '0 0 20px rgba(79,142,247,0.5)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = `linear-gradient(180deg, rgba(79,142,247,${0.4 + h/200}) 0%, rgba(79,142,247,0.2) 100%)`;
                          e.currentTarget.style.boxShadow  = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  {['L','M','X','J','V','S','D'].map(d => (
                    <span key={d} style={{ fontSize: '0.62rem', fontWeight: 600, color: 'rgba(232,240,254,0.25)', textAlign: 'center', flex: 1 }}>{d}</span>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{ ...glass.base, padding: '24px' }}>
                <h3 style={{ ...secTitle, marginBottom: '16px' }}>
                  <ClockIcon style={{ width: '18px', height: '18px', color: '#4f8ef7' }} />
                  Actividad Reciente
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {recentTransactions.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'rgba(232,240,254,0.28)', textAlign: 'center', padding: '20px 0' }}>Sin actividad reciente.</p>
                  ) : (
                    recentTransactions.slice(0, 4).map((t) => {
                      const isOutgoing = t.type === 'TRANSFER' && t.sourceAccount?.externalUserId === user?.id;
                      return (
                        <div key={t._id || t.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 12px', borderRadius: '10px',
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer', transition: 'background 0.15s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.07)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                              background: isOutgoing ? 'rgba(248,113,113,0.12)' : 'rgba(0,212,160,0.12)',
                              border: `1px solid ${isOutgoing ? 'rgba(248,113,113,0.2)' : 'rgba(0,212,160,0.2)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <ArrowPathIcon style={{ width: '14px', height: '14px', color: isOutgoing ? '#f87171' : '#00d4a0' }} />
                            </div>
                            <div>
                              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e8f0fe', marginBottom: '1px' }}>
                                {t.type === 'TRANSFER' ? 'Transferencia' : t.type}
                              </p>
                              <p style={{ fontSize: '0.62rem', color: 'rgba(232,240,254,0.3)' }}>
                                {formatDateTime(t.createdAt)}
                              </p>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.845rem', fontWeight: 700, color: isOutgoing ? '#f87171' : '#00d4a0' }}>
                            {isOutgoing ? '−' : '+'} Q {Number(t.amount).toFixed(2)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* ══ RIGHT COLUMN ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Account request card */}
            <div style={{ ...glass.base, padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '10px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e8f0fe', margin: 0 }}>Solicitud de cuenta</h3>
                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '0.6rem',
                  fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                  background: pendingRequest ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.06)',
                  color: pendingRequest ? '#fbbf24' : 'rgba(232,240,254,0.4)',
                  border: `1px solid ${pendingRequest ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  {pendingRequest ? 'Pendiente' : accountSummary.hasAnyAccount ? 'Ya tienes cuenta' : 'Disponible'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(232,240,254,0.4)', lineHeight: 1.6, marginBottom: '14px' }}>
                Si necesitas una nueva cuenta, envía la solicitud y el administrador la aprobará manualmente.
              </p>
              <button
                onClick={handleRequestAccount}
                disabled={!canRequestAccount || requesting}
                style={{
                  width: '100%', padding: '11px', borderRadius: '10px', fontSize: '0.845rem',
                  fontWeight: 700, cursor: (!canRequestAccount || requesting) ? 'not-allowed' : 'pointer',
                  border: 'none', transition: 'all 0.18s', opacity: (!canRequestAccount || requesting) ? 0.5 : 1,
                  background: 'linear-gradient(135deg,#4f8ef7,#2563eb)',
                  color: '#fff', boxShadow: '0 4px 18px rgba(79,142,247,0.35)',
                }}
              >
                {requesting ? 'Enviando…' : pendingRequest ? 'Solicitud en revisión' : accountSummary.hasAnyAccount ? 'Ya tienes cuenta' : 'Solicitar nueva cuenta'}
              </button>
              {pendingRequest && (
                <p style={{ marginTop: '10px', fontSize: '0.72rem', color: '#fbbf24' }}>
                  Solicitud pendiente desde {formatDate(pendingRequest.createdAt)}.
                </p>
              )}
            </div>

            {/* Transfer Widget — dark glass */}
            <div style={{ ...glass.dark, padding: '24px', position: 'sticky', top: '88px' }}>
              {/* Mesh decorations */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '16px', pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,142,247,0.15),transparent 70%)' }} />
                <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,160,0.1),transparent 70%)' }} />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'linear-gradient(135deg,#4f8ef7,#00d4a0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(79,142,247,0.4)',
                  }}>
                    <ArrowPathIcon style={{ width: '18px', height: '18px', color: '#fff' }} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#e8f0fe', margin: 0 }}>Transferencia Rápida</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* From */}
                  <div>
                    <label style={labelStyle}>Desde Cuenta</label>
                    <select
                      style={{ ...inputStyle, cursor: 'pointer' }}
                      value={selectedFrom}
                      onChange={(e) => setSelectedFrom(e.target.value)}
                    >
                      <option value="">Selecciona cuenta</option>
                      {activeAccounts.map(acc => (
                        <option key={acc._id || acc.id} value={acc._id || acc.id} style={{ background: '#0a2540' }}>
                          {acc.accountNumber} — Q {acc.balance}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* To */}
                  <div>
                    <label style={labelStyle}>Destinatario</label>
                    <input
                      type="text"
                      placeholder="Número de cuenta…"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label style={labelStyle}>Monto (Q)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    style={{
                      width: '100%', padding: '14px', borderRadius: '12px', fontSize: '0.9rem',
                      fontWeight: 700, border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg,#e8f0fe,#c7dafe)',
                      color: '#0a2540', letterSpacing: '0.02em',
                      boxShadow: '0 6px 24px rgba(232,240,254,0.15)',
                      transition: 'all 0.18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(232,240,254,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(232,240,254,0.15)'; }}
                    onClick={() => {
                      setConfirmPayload({ from: selectedFrom, to: recipient, amount });
                      setConfirmOpen(true);
                    }}
                  >
                    Confirmar Transferencia
                  </button>

                  <p style={{ fontSize: '0.68rem', color: 'rgba(232,240,254,0.35)', textAlign: 'center' }}>
                    Límite diario restante: Q {remainingDailyTransferLimit.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </p>

                  {lastTransferSuccess && (
                    <div style={{
                      borderRadius: '10px', padding: '12px 14px',
                      background: 'rgba(0,212,160,0.1)', border: '1px solid rgba(0,212,160,0.25)',
                    }}>
                      <p style={{ fontSize: '0.78rem', color: '#00d4a0', marginBottom: '8px' }}>✓ Transferencia realizada</p>
                      <button
                        style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4f8ef7', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onClick={() => { setLastTransferSuccess(false); setRecipient(''); setAmount(''); setSelectedFrom(''); }}
                      >
                        Nueva transferencia →
                      </button>
                    </div>
                  )}

                  {/* Favorites */}
                  {favorites.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(232,240,254,0.4)', margin: 0 }}>Favoritos</p>
                        <button
                          style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4f8ef7', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          onClick={() => setShowAddFavForm(s => !s)}
                        >
                          {showAddFavForm ? 'Cerrar' : '+ Agregar'}
                        </button>
                      </div>

                      {showAddFavForm && (
                        <div style={{ borderRadius: '10px', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '10px' }}>
                          <input placeholder="Número de cuenta" value={newFavAccount} onChange={(e) => setNewFavAccount(e.target.value)} style={{ ...inputStyle, marginBottom: '8px' }} />
                          <input placeholder="Alias (opcional)" value={newFavAlias} onChange={(e) => setNewFavAlias(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }} />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, background: 'rgba(79,142,247,0.2)', border: '1px solid rgba(79,142,247,0.3)', color: '#a5c8ff', cursor: 'pointer' }}
                              onClick={async () => {
                                    if (!newFavAccount) { showError('Ingresa número de cuenta'); return; }
                                try {
                                      const resolved = await getAccountByNumber(newFavAccount);
                                      const accountId = resolved?.data?.account?._id || resolved?.data?._id || resolved?.data?.account?.id || resolved?.data?.id;
                                      if (!accountId) { showError('No se pudo resolver la cuenta para favoritos'); return; }
                                      const res = await addFavorite({ accountId, alias: newFavAlias });
                                  const created = res?.data?.favorite ?? res?.data ?? null;
                                  if (created) setFavorites(prev => [created, ...prev]);
                                  setNewFavAccount(''); setNewFavAlias(''); setShowAddFavForm(false);
                                  showSuccess('Favorito agregado');
                                } catch (err) { showError(err?.response?.data?.message || 'Error al agregar favorito'); }
                              }}
                            >Guardar</button>
                            <button
                              style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,240,254,0.5)', cursor: 'pointer' }}
                              onClick={() => setShowAddFavForm(false)}
                            >Cancelar</button>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {favorites.map(f => {
                          const acctNum = f.accountNumber || f.account?.accountNumber || f.accountId || '';
                          const display = f.alias || f.name || acctNum || 'Favorito';
                          return (
                            <button
                              key={f._id || f.id || f.accountId || acctNum}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '9px 12px', borderRadius: '9px', fontSize: '0.78rem', fontWeight: 600,
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                color: '#e8f0fe', cursor: 'pointer', transition: 'background 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.12)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                              onClick={() => handleUseFavorite(f)}
                            >
                              <span>{display}</span>
                              <span style={{ fontSize: '0.62rem', color: '#4f8ef7', letterSpacing: '0.06em' }}>Usar →</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <ConversionModal accountId={conversionAccount} isOpen={conversionOpen} onClose={() => setConversionOpen(false)} />

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.62rem', color: 'rgba(232,240,254,0.22)', letterSpacing: '0.06em' }}>
                    🔒 Transacciones cifradas de extremo a extremo
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══ Confirm Transfer Modal — lógica original ══ */}
      {confirmOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
          <div style={{
            ...glass.base,
            width: '100%', maxWidth: '420px',
            background: 'rgba(10,18,35,0.96)',
            border: '1px solid rgba(79,142,247,0.2)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
            animation: 'modalIn 0.25s cubic-bezier(0.22,1,0.36,1) both',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: '"DM Serif Display",Georgia,serif', fontSize: '1.15rem', color: '#e8f0fe', margin: 0 }}>Confirmar Transferencia</h3>
                <p style={{ fontSize: '0.75rem', color: 'rgba(232,240,254,0.38)', marginTop: '2px' }}>Verifica los datos antes de confirmar</p>
              </div>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,240,254,0.6)', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >×</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* From */}
              <div>
                <label style={labelStyle}>Desde</label>
                <select className="modal-input" style={{ ...inputStyle, cursor: 'pointer' }} value={confirmPayload.from || selectedFrom} onChange={(e) => setConfirmPayload(p => ({ ...p, from: e.target.value }))}>
                  <option value="">Selecciona cuenta</option>
                  {accounts.map(acc => (
                    <option key={acc._id || acc.id} value={acc._id || acc.id} style={{ background: '#0a2540' }}>
                      {acc.accountNumber} - Q {acc.balance}
                    </option>
                  ))}
                </select>
              </div>
              {/* To */}
              <div>
                <label style={labelStyle}>Destinatario</label>
                <input className="modal-input" style={inputStyle} value={confirmPayload.to || recipient} onChange={(e) => setConfirmPayload(p => ({ ...p, to: e.target.value }))} />
              </div>
              {/* Amount */}
              <div>
                <label style={labelStyle}>Monto (Q)</label>
                <input className="modal-input" style={inputStyle} type="number" value={confirmPayload.amount || amount} onChange={(e) => setConfirmPayload(p => ({ ...p, amount: e.target.value }))} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                style={{ padding: '10px 18px', borderRadius: '9px', fontSize: '0.845rem', fontWeight: 600, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,240,254,0.6)', cursor: 'pointer' }}
                onClick={() => setConfirmOpen(false)}
              >Cancelar</button>
              <button
                style={{ padding: '10px 22px', borderRadius: '9px', fontSize: '0.845rem', fontWeight: 700, background: 'linear-gradient(135deg,#4f8ef7,#2563eb)', border: 'none', color: '#fff', cursor: transferLoading ? 'not-allowed' : 'pointer', opacity: transferLoading ? 0.65 : 1, boxShadow: '0 4px 18px rgba(79,142,247,0.35)' }}
                disabled={transferLoading}
                onClick={() => performTransfer()}
              >
                {transferLoading ? 'Procesando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        select option { background: #0a2540; color: #e8f0fe; }
      `}</style>
    </div>
  );
};

/* ── QuickActionCard — rediseño visual, props idénticos ── */
const QuickActionCard = ({ icon: Icon, label, color, glow = 'rgba(79,142,247,0.3)', onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            '12px',
      padding:        '20px 12px',
      borderRadius:   '14px',
      background:     'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(12px)',
      border:         '1px solid rgba(255,255,255,0.08)',
      cursor:         disabled ? 'not-allowed' : 'pointer',
      opacity:        disabled ? 0.5 : 1,
      transition:     'all 0.2s ease',
      width:          '100%',
    }}
    onMouseEnter={e => {
      if (!disabled) {
        e.currentTarget.style.transform   = 'translateY(-3px)';
        e.currentTarget.style.background  = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
        e.currentTarget.style.boxShadow   = `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)`;
      }
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform   = 'translateY(0)';
      e.currentTarget.style.background  = 'rgba(255,255,255,0.04)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      e.currentTarget.style.boxShadow   = 'none';
    }}
  >
    <div style={{
      width: '46px', height: '46px', borderRadius: '12px',
      background: color, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 6px 20px ${glow}`,
      transition: 'transform 0.2s',
    }}>
      <Icon style={{ width: '22px', height: '22px', color: '#fff' }} />
    </div>
    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(232,240,254,0.7)', textAlign: 'center', lineHeight: 1.3 }}>
      {label}
    </span>
  </button>
);