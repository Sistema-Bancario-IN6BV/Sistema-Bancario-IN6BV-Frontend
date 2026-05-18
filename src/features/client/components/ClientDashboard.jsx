import React, { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { useUserManagmentStore } from '../../users/store/useUserManagmentStore';
import { CreditCardItem } from '../../accounts/components/CreditCardItem';
import { getMyAccountRequests, getMyAccountSummary, requestAccount, getFavorites, addFavorite, getMyTransactions, createTransaction } from '../../../shared/api/admin';
import { Spinner } from '../../../shared/components/layouts/Spinner';
import ConversionModal from '../../../shared/components/ui/ConversionModal';
import { showError, showSuccess } from '../../../shared/utils/toast';
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

const statusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE': return "bg-emerald-400/20 text-emerald-100 border border-emerald-300/30";
        case 'BLOCKED': return "bg-yellow-400/20 text-yellow-100 border border-yellow-300/30";
        case 'CLOSED': return "bg-rose-400/20 text-rose-100 border border-rose-300/30";
        default: return "bg-slate-400/20 text-slate-100 border border-slate-300/30";
    }
};

export const ClientDashboard = () => {
    const { user } = useAuthStore();
    const { accounts = [], loading: accountsLoading } = useAccountStore();
    const { users } = useUserManagmentStore();
    const [accountRequests, setAccountRequests] = useState([]);
    const [accountSummary, setAccountSummary] = useState({ totalAccounts: 0, hasAnyAccount: false, hasPendingRequest: false });
    const [requesting, setRequesting] = useState(false);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [conversionOpen, setConversionOpen] = useState(false);
    const [conversionAccount, setConversionAccount] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmPayload, setConfirmPayload] = useState({ from: '', to: '', amount: '' });
    const [transferLoading, setTransferLoading] = useState(false);
    const [lastTransferSuccess, setLastTransferSuccess] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [selectedFrom, setSelectedFrom] = useState('');
    const [amount, setAmount] = useState('');
    const [showAddFavForm, setShowAddFavForm] = useState(false);
    const [newFavAccount, setNewFavAccount] = useState('');
    const [newFavAlias, setNewFavAlias] = useState('');

    const isAdmin = user?.role === 'ADMIN_ROLE' || user?.role === 'PLATFORM_ADMIN';
    const isClient = user?.role === 'USER_ROLE' || user?.role === 'CUSTOMER';

    const myAccountOwner = useMemo(() => {
        return users.find(u => u.uid === user?.id || u.id === user?.id);
    }, [users, user]);

    const pendingRequest = useMemo(() => {
        return accountRequests.find((request) => request.status === 'PENDING');
    }, [accountRequests]);

    const totalBalance = useMemo(() => {
        return accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
    }, [accounts]);

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

        // load recent transactions and accounts
        const loadMisc = async () => {
            try {
                // ensure accounts are loaded
                await useAccountStore.getState().getAccounts();
                const txRes = await getMyTransactions(5);
                const txs = txRes.data?.transactions ?? txRes.data ?? [];
                setRecentTransactions(Array.isArray(txs) ? txs : []);
                // load favorites for quick transfer
                try {
                    const favRes = await getFavorites();
                    const favs = favRes?.data?.favorites ?? favRes?.data ?? [];
                    setFavorites(Array.isArray(favs) ? favs : []);
                } catch (err) {
                    // ignore
                }
            } catch (err) {
                // silently ignore for now
                console.error('Error loading recent transactions', err);
            }
        };

        loadMisc().catch(() => {});
    }, []);

    const performTransfer = async () => {
        try {
            setTransferLoading(true);

            const from = confirmPayload.from || selectedFrom;
            const to = confirmPayload.to || recipient;
            const favoriteId = confirmPayload.favoriteId;
            const transferAmount = Number(confirmPayload.amount || amount);

            if (!from) { showError('Selecciona la cuenta origen'); return; }
            if (!favoriteId && !to) { showError('Ingresa o selecciona un destinatario'); return; }
            if (!transferAmount || transferAmount <= 0) { showError('Ingresa un monto válido'); return; }

            const payload = { type: 'TRANSFER', amount: transferAmount, sourceAccount: from };
            if (favoriteId) payload.favoriteId = favoriteId;
            else payload.destinationAccount = to;

            const res = await createTransaction(payload);

            if (res?.data?.success) {
                showSuccess('Transferencia realizada');
                // refresh recent transactions
                try {
                    const txRes = await getMyTransactions(5);
                    const txs = txRes.data?.transactions ?? txRes.data ?? [];
                    setRecentTransactions(Array.isArray(txs) ? txs : []);
                } catch (err) {
                    // ignore
                }

                setConfirmOpen(false);
                setRecipient('');
                setAmount('');
                setSelectedFrom('');
                setConfirmPayload({ from: '', to: '', amount: '' });
                setLastTransferSuccess(true);
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

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(46,111,212,0.10),_transparent_28%),linear-gradient(180deg,_#f4f8fc_0%,_#edf3f9_100%)] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1440px] space-y-8">

                {/* --- Welcome Header --- */}
                <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                            Hola, <span className="text-[#0f7bdf]">{user?.name || 'Usuario'}</span> 👋
                        </h1>
                        <p className="text-slate-500 text-sm sm:text-base">
                            Bienvenido de nuevo a tu banca en línea. Aquí tienes un resumen de tu estado financiero.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saldo Total Consolidado</span>
                            <span className="text-2xl font-bold text-slate-900">Q {totalBalance.toLocaleString("es-GT", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="h-12 w-12 rounded-sm bg-white shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
                            <UserIcon />
                        </div>
                    </div>
                </header>

                <div className="grid gap-8 lg:grid-cols-3">

                    {/* --- Left Column: Accounts & Quick Actions --- */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Account Cards Grid */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <CreditCardIcon className="h-5 w-5 text-blue-600" />
                                    Tus Cuentas
                                </h2>
                                <button className="text-xs font-medium text-blue-600 hover:underline">Ver todas</button>
                            </div>

                            <div className="flex gap-6 overflow-x-auto pb-4 snap-x no-scrollbar">
                                {accountsLoading ? (
                                    <div className="flex h-48 w-full items-center justify-center"><Spinner /></div>
                                ) : accounts.length === 0 ? (
                                    <div className="flex h-48 w-full items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
                                        No tienes cuentas activas.
                                    </div>
                                ) : (
                                    accounts.map(acc => (
                                        <div key={acc._id || acc.id} className="snap-center shrink-0">
                                            <CreditCardItem
                                                account={acc}
                                                accountOwner={myAccountOwner}
                                                statusBadgeClass={statusBadgeClass}
                                            />
                                            <div className="mt-2 flex gap-2">
                                                {(isAdmin || (isClient && acc.externalUserId === user?.id)) && (
                                                    <button
                                                        className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                        onClick={() => { setConversionAccount(acc._id || acc.id); setConversionOpen(true); }}
                                                    >
                                                        <BanknotesIcon className="w-4 h-4" />
                                                        Cambio divisas
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Quick Actions Grid */}

                                    {/* Confirm Transfer Modal */}
                                    {confirmOpen && (
                                        <div className="modal-overlay">
                                            <div className="modal narrow">
                                                <div className="modal-header">
                                                    <div className="modal-header-info">
                                                        <h3 className="modal-title">Confirmar Transferencia</h3>
                                                        <p className="modal-subtitle">Verifica los datos antes de confirmar</p>
                                                    </div>
                                                    <button className="modal-close on-dark" onClick={() => setConfirmOpen(false)}>×</button>
                                                </div>
                                                <div className="modal-body">
                                                    <div className="modal-field">
                                                        <label className="modal-label">Desde</label>
                                                        <select className="modal-input" value={confirmPayload.from || selectedFrom} onChange={(e) => setConfirmPayload(p => ({...p, from: e.target.value}))}>
                                                            <option value="">Selecciona cuenta</option>
                                                            {accounts.map(acc => (
                                                                <option key={acc._id || acc.id} value={acc._id || acc.id}>{acc.accountNumber} - Q {acc.balance}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="modal-field">
                                                        <label className="modal-label">Destinatario</label>
                                                        <input className="modal-input" value={confirmPayload.to || recipient} onChange={(e) => setConfirmPayload(p => ({...p, to: e.target.value}))} />
                                                    </div>
                                                    <div className="modal-field">
                                                        <label className="modal-label">Monto (Q)</label>
                                                        <input className="modal-input" type="number" value={confirmPayload.amount || amount} onChange={(e) => setConfirmPayload(p => ({...p, amount: e.target.value}))} />
                                                    </div>
                                                </div>
                                                <div className="modal-footer">
                                                    <button className="btn-secondary" onClick={() => setConfirmOpen(false)}>Cancelar</button>
                                                    <button className="btn-primary" disabled={transferLoading} onClick={() => performTransfer()}>
                                                        {transferLoading ? 'Procesando...' : 'Confirmar'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                        <section className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-800 px-2 flex items-center gap-2">
                                <BoltIcon className="h-5 w-5 text-blue-600" />
                                Acceso Rápido
                            </h2>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <QuickActionCard icon={ArrowPathIcon} label="Transferir" color="bg-blue-600" />
                                <QuickActionCard icon={BanknotesIcon} label="Pago de Servicios" color="bg-emerald-600" />
                                <QuickActionCard
                                    icon={PlusCircleIcon}
                                    label={pendingRequest ? 'Solicitud enviada' : 'Solicitar Cuenta'}
                                    color={pendingRequest ? 'bg-slate-500' : 'bg-indigo-600'}
                                    onClick={handleRequestAccount}
                                    disabled={!canRequestAccount || requesting}
                                />
                            </div>
                        </section>

                        {/* Financial Insights */}
                        <section className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-md border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <ChartBarIcon className="h-5 w-5 text-blue-600" />
                                        Análisis de Gastos
                                    </h3>
                                </div>
                                <div className="flex items-end justify-center gap-3 h-32">
                                    {/* Mock Chart Bars */}
                                    {[40, 70, 45, 90, 65, 30, 50].map((h, i) => (
                                        <div key={i} className="relative group">
                                            <div
                                                className="w-6 rounded-t-lg bg-blue-500 transition-all duration-300 group-hover:bg-blue-400"
                                                style={{ height: `${h}%` }}
                                            />
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Q{h * 100}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex justify-between text-[10px] font-medium text-slate-400 px-2">
                                    <span>Lun</span><span>Mar</span><span>Mie</span><span>Jue</span><span>Vie</span><span>Sab</span><span>Dom</span>
                                </div>
                            </div>

                            <div className="rounded-md border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
                                <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                    <ClockIcon className="h-5 w-5 text-blue-600" />
                                    Actividad Reciente
                                </h3>
                                <div className="space-y-4">
                                    {recentTransactions.length === 0 ? (
                                        <div className="text-sm text-slate-400">No hay actividad reciente.</div>
                                    ) : (
                                        recentTransactions.map((t) => (
                                            <div key={t._id || t.id} className="flex items-center justify-between p-3 rounded-md hover:bg-slate-50 transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-sm bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                        <ArrowPathIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{t.type === 'TRANSFER' ? 'Transferencia' : t.type}</p>
                                                        <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleString('es-GT')}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-sm font-bold ${t.type === 'TRANSFER' && t.sourceAccount && t.sourceAccount.externalUserId === user?.id ? 'text-rose-500' : 'text-emerald-600'}`}>
                                                    {t.type === 'TRANSFER' && t.sourceAccount && t.sourceAccount.externalUserId === user?.id ? '- ' : ''}Q {Number(t.amount).toFixed(2)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* --- Right Column: Quick Transfer Widget --- */}
                    <div className="lg:col-span-1">
                        <div className="mb-6 rounded-md border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="text-lg font-semibold text-slate-800">Solicitud de cuenta</h3>
                                <span className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    {pendingRequest ? 'Pendiente' : accountSummary.hasAnyAccount ? 'Ya tienes cuenta' : 'Disponible'}
                                </span>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Si necesitas una nueva cuenta, envía la solicitud y el administrador la aprobará manualmente.
                            </p>
                            <button
                                className="mt-4 w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={handleRequestAccount}
                                disabled={!canRequestAccount || requesting}
                            >
                                {requesting ? 'Enviando...' : pendingRequest ? 'Solicitud en revisión' : accountSummary.hasAnyAccount ? 'Ya tienes cuenta' : 'Solicitar nueva cuenta'}
                            </button>
                            {pendingRequest && (
                                <p className="mt-3 text-xs text-amber-600">
                                    Tienes una solicitud pendiente desde {new Date(pendingRequest.createdAt).toLocaleDateString('es-GT')}.
                                </p>
                            )}
                            {!pendingRequest && accountSummary.hasAnyAccount && (
                                <p className="mt-3 text-xs text-slate-500">
                                    Ya existe una cuenta registrada para tu usuario. No puedes solicitar otra.
                                </p>
                            )}
                        </div>

                        <div className="sticky top-8 rounded-md border border-white/70 bg-[linear-gradient(180deg,_#0a2540_0%,_#1a4b8c_100%)] p-6 text-white shadow-xl shadow-blue-900/20">
                            <div className="flex items-center gap-2 mb-6">
                                <ArrowPathIcon className="h-6 w-6 text-blue-300" />
                                <h3 className="text-lg font-semibold">Transferencia Rápida</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-blue-200/70 px-1">Desde Cuenta</label>
                                    <select className="w-full rounded-md border border-white/10 bg-white/10 px-4 py-3 text-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-400" value={selectedFrom} onChange={(e) => setSelectedFrom(e.target.value)}>
                                        <option value="">Selecciona cuenta</option>
                                        {accounts.map(acc => (
                                            <option key={acc._id || acc.id} value={acc._id || acc.id} className="text-slate-900">
                                                {acc.accountNumber} - Q {acc.balance}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-blue-200/70 px-1">Destinatario (Cuenta)</label>
                                    <input
                                        type="text"
                                        placeholder="Número de cuenta..."
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        className="w-full rounded-md border border-white/10 bg-white/10 px-4 py-3 text-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-blue-200/70 px-1">Monto (Q)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full rounded-md border border-white/10 bg-white/10 px-4 py-3 text-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <button className="w-full rounded-md bg-white py-4 text-sm font-bold text-blue-900 transition-all hover:bg-blue-50 active:scale-95 shadow-lg shadow-white/10">
                                    <span onClick={() => {
                                        setConfirmPayload({ from: selectedFrom, to: recipient, amount });
                                        setConfirmOpen(true);
                                    }}>Confirmar Transferencia</span>
                                </button>
                                {lastTransferSuccess && (
                                    <div className="mt-4 p-3 rounded-md bg-white/10 text-white text-sm">
                                        <div className="flex items-center justify-between">
                                            <span>Transferencia realizada — historial actualizado</span>
                                            <div className="flex gap-2">
                                                <button className="btn-secondary" onClick={() => {
                                                    setLastTransferSuccess(false);
                                                    setRecipient(''); setAmount(''); setSelectedFrom('');
                                                }}>Nueva transferencia</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {favorites.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-white/90 mb-2">Favoritos</h4>
                                        <div className="flex gap-2 mb-2">
                                            <button className="btn-primary" onClick={() => setShowAddFavForm(s => !s)}>{showAddFavForm ? 'Cerrar' : 'Agregar favorito'}</button>
                                        </div>
                                        {showAddFavForm && (
                                            <div className="mb-3 p-3 rounded bg-white/6">
                                                <div className="space-y-2">
                                                    <input placeholder="Número de cuenta" value={newFavAccount} onChange={(e) => setNewFavAccount(e.target.value)} className="modal-input" />
                                                    <input placeholder="Alias (opcional)" value={newFavAlias} onChange={(e) => setNewFavAlias(e.target.value)} className="modal-input" />
                                                    <div className="flex gap-2">
                                                        <button className="btn-primary" onClick={async () => {
                                                            if (!newFavAccount) { showError('Ingresa número de cuenta'); return; }
                                                            try {
                                                                const res = await addFavorite({ accountNumber: newFavAccount, alias: newFavAlias });
                                                                const created = res?.data?.favorite ?? res?.data ?? null;
                                                                if (created) setFavorites(prev => [created, ...prev]);
                                                                setNewFavAccount(''); setNewFavAlias(''); setShowAddFavForm(false);
                                                                showSuccess('Favorito agregado');
                                                            } catch (err) {
                                                                showError(err?.response?.data?.message || 'Error al agregar favorito');
                                                            }
                                                        }}>Guardar</button>
                                                        <button className="btn-secondary" onClick={() => setShowAddFavForm(false)}>Cancelar</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-2">
                                                {favorites.map(f => {
                                                    const acctNum = f.accountNumber || f.account?.accountNumber || f.accountId || f.account?._id || '';
                                                    const display = f.alias || f.name || acctNum || 'Favorito';
                                                    return (
                                                        <button key={f._id || f.id || f.accountId || acctNum} className="flex items-center justify-between rounded-md bg-white/10 px-3 py-2 text-sm" onClick={() => {
                                                            // Prefill recipient and also set 'Desde' account (first available account)
                                                            setRecipient(acctNum);
                                                            const firstAcc = accounts && accounts.length ? accounts.find(a => a.status === 'ACTIVE') || accounts[0] : null;
                                                            if (firstAcc) setSelectedFrom(firstAcc._id || firstAcc.id || '');
                                                            setAmount('');
                                                            // open confirm transfer modal (attach favorite id)
                                                            setConfirmPayload({ from: firstAcc?._id || firstAcc?.id || '', to: acctNum, amount: '', favoriteId: f._id });
                                                            setConfirmOpen(true);
                                                        }}>
                                                            <span>{display}</span>
                                                            <span className="text-xs text-blue-200/80">Usar</span>
                                                        </button>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <ConversionModal accountId={conversionAccount} isOpen={conversionOpen} onClose={() => setConversionOpen(false)} />

                            <div className="mt-6 pt-6 border-t border-white/10 text-center">
                                <p className="text-[10px] text-blue-300/60">
                                    Transacciones seguras cifradas de extremo a extremo.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const QuickActionCard = ({ icon: Icon, label, color, onClick, disabled }) => (
    <button
      className="group relative flex flex-col items-center justify-center gap-3 rounded-md border border-white/70 bg-white/90 p-6 text-center shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      onClick={onClick}
      disabled={disabled}
    >
        <div className={`flex h-12 w-12 items-center justify-center rounded-sm ${color} text-white shadow-lg transition-transform group-hover:scale-110`}>
            <Icon className="h-6 w-6" />
        </div>
        <span className="text-xs font-bold text-slate-700">{label}</span>
    </button>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM13.5 10.5H21A2.25 2.25 0 0 0 21 8.25V6.75M13.5 10.5H2.25A2.25 2.25 0 0 0 2.25 8.25V6.75M13.5 10.5V3.75M13.5 10.5H12.75M13.5 10.5H13.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75C6.782 12.75 3 16.5 3 20.25V21h18V20.25c0-3.75-3.782-7.5-9-7.5z" />
    </svg>
);
