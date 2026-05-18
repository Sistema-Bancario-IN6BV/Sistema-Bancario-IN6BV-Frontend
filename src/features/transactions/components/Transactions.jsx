import React, { useState, useEffect, useMemo } from 'react';
import { getTransactions } from '../../../shared/api/admin';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { Spinner } from "../../../shared/components/layouts/Spinner.jsx";
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CreditCardIcon
} from "@heroicons/react/24/outline";

/* — Helpers de tipos y colores — */
const getTransactionType = (type) => {
    const types = {
        transfer:   'Transferencia',
        deposit:    'Depósito',
        withdrawal: 'Retiro',
        payment:    'Pago',
    };
    return types[type] || type;
};

const txTypeStyle = {
    deposit:    "bg-emerald-400/20 text-emerald-600 border-emerald-300/30",
    withdrawal: "bg-rose-400/20 text-rose-600 border-rose-300/30",
    transfer:   "bg-blue-400/20 text-blue-600 border-blue-300/30",
    payment:    "bg-amber-400/20 text-amber-600 border-amber-300/30",
};

const statusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
        case 'completed':
        case 'approved': return "bg-emerald-400/20 text-emerald-100 border border-emerald-300/30";
        case 'pending':    return "bg-yellow-400/20 text-yellow-100 border border-yellow-300/30";
        case 'rejected':
        case 'failed':     return "bg-rose-400/20 text-rose-100 border border-rose-300/30";
        default:           return "bg-slate-400/20 text-slate-100 border border-slate-300/30";
    }
};

const IconRefresh = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M8 16H3v5"/>
    </svg>
);

const IconArrowDown  = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14m7-7-7 7-7-7"/></svg>
);
const IconArrowUp    = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5m7 7-7-7-7 7"/></svg>
);
const IconArrowRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
);
const IconCard       = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
);

const getTxIcon = (type) => {
    const map = {
        deposit:    { cls: 'deposit',    Icon: IconArrowDown  },
        withdrawal: { cls: 'withdrawal', Icon: IconArrowUp    },
        transfer:   { cls: 'transfer',   Icon: IconArrowRight },
        payment:    { cls: 'payment',    Icon: IconCard       },
    };
    const entry = map[type] || { cls: 'transfer', Icon: IconArrowRight };
    return (
        <span className={`tx-icon ${entry.cls}`}>
            <entry.Icon />
        </span>
    );
};

const statusBadge = (status) => {
    if (status === 'completed' || status === 'approved')
        return <span className="badge badge-success">{status}</span>;
    if (status === 'pending')
        return <span className="badge badge-warning">{status}</span>;
    if (status === 'rejected' || status === 'failed')
        return <span className="badge badge-danger">{status}</span>;
    return <span className="badge badge-neutral">{status}</span>;
};

export const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading]           = useState(true);

    useEffect(() => { loadTransactions(); }, []);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const res = await getTransactions({ limit: 50 });
            const data = res.data?.transactions ?? res.data?.transaction ?? res.data ?? [];
            setTransactions(Array.isArray(data) ? data : []);
            showSuccess('Transacciones cargadas');
        } catch (error) {
            showError('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const totalVolume = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
        const netFlow = transactions.reduce((sum, tx) => {
            return (tx.type === 'deposit') ? sum + tx.amount : sum - tx.amount;
        }, 0);
        const pendingCount = transactions.filter(tx => tx.status === 'pending').length;
        const totalCount = transactions.length;

        return [
            { label: "Volumen Total", value: `Q ${totalVolume.toLocaleString(undefined, {maximumFractionDigits: 2})}`, icon: CurrencyDollarIcon, tone: "from-blue-600 to-slate-900" },
            { label: "Flujo Neto", value: `Q ${netFlow.toLocaleString(undefined, {maximumFractionDigits: 2})}`, icon: ArrowTrendingUpIcon, tone: "from-emerald-500 to-teal-700" },
            { label: "Pendientes", value: pendingCount, icon: ClockIcon, tone: "from-amber-500 to-orange-700" },
            { label: "Total Movimientos", value: totalCount, icon: CreditCardIcon, tone: "from-indigo-500 to-blue-800" },
        ];
    }, [transactions]);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(46,111,212,0.10),_transparent_28%),linear-gradient(180deg,_#f4f8fc_0%,_#edf3f9_100%)] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1440px] space-y-6">
                {/* Hero Section */}
                <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_#0a2540_0%,_#123b67_55%,_#1a4b8c_100%)] px-6 py-6 text-white shadow-[0_20px_60px_rgba(10,37,64,0.22)] sm:px-8 sm:py-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(90,156,245,0.28),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(0,196,140,0.16),_transparent_25%)]" />
                    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur">
                                <CreditCardIcon className="h-4 w-4" />
                                Auditoría Financiera
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                    Historial de Transacciones
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
                                    Monitoreo detallado de todos los movimientos financieros, depósitos y transferencias procesadas por el sistema.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 xl:justify-end">
                            <button
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
                                onClick={loadTransactions}
                                disabled={loading}
                            >
                                <ArrowPathIcon className="h-4 w-4" />
                                {loading ? 'Cargando...' : 'Actualizar Datos'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Stats Row */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map(({ label, value, icon: Icon, tone }) => (
                        <article key={label} className="group relative overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_10px_30px_rgba(10,37,64,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(10,37,64,0.12)]">
                            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone}`} />
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
                                    <p className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">{value}</p>
                                </div>
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                {/* Table Container */}
                <section className="rounded-[2rem] border border-white/70 bg-white/88 p-4 shadow-[0_18px_50px_rgba(10,37,64,0.08)] backdrop-blur sm:p-6">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Spinner />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-20 text-center text-slate-500">
                            <div className="mb-4 flex h-16 w-1 la-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
                                <CreditCardIcon className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900">No hay transacciones registradas</h2>
                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                El historial de movimientos se encuentra vacío. Realice la primera operación para verla aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-slate-500">
                                    <tr className="border-b border-slate-200">
                                        <th className="px-4 py-4 font-semibold uppercase tracking-wider">Tipo</th>
                                        <th className="px-4 py-4 font-semibold uppercase tracking-wider">Fecha</th>
                                        <th className="px-4 py-4 font-semibold uppercase tracking-wider">Monto</th>
                                        <th className="px-4 py-4 font-semibold uppercase tracking-wider">Referencia</th>
                                        <th className="px-4 py-4 text-right font-semibold uppercase tracking-wider">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="group transition-colors hover:bg-slate-50/50">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${txTypeStyle[tx.type] || txTypeStyle.transfer}`}>
                                                        {tx.type[0].toUpperCase()}
                                                    </span>
                                                    <span className="font-medium text-slate-900">{getTransactionType(tx.type)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-slate-500">
                                                {new Date(tx.date).toLocaleDateString('es-GT', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`font-semibold ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                    Q {tx.amount.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-slate-400 font-mono">
                                                {tx.reference || '—'}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(tx.status)}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && transactions.length > 0 && (
                        <div className="mt-6 flex items-center justify-between px-2">
                            <span className="text-xs text-slate-500">
                                {transactions.length} transacciones registradas
                            </span>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Transactions;