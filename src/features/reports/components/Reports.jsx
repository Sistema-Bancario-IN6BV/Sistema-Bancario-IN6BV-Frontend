import React, { useEffect, useMemo, useState } from 'react';
import { getTransactions } from '../../../shared/api/admin';
import { Spinner } from '../../../shared/components/layouts/Spinner.jsx';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

const formatMoney = (value) => `Q ${Number(value || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Metric = ({ label, value, icon: Icon, tone }) => (
  <article className="group relative overflow-hidden rounded-md border border-white/70 bg-white/90 p-5 shadow-[0_10px_30px_rgba(10,37,64,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(10,37,64,0.12)]">
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone}`} />
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">{value}</p>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-to-br ${tone} text-white shadow-lg`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </article>
);

export const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await getTransactions({ limit: 100 });
      const data = res.data?.transactions ?? res.data?.transaction ?? res.data ?? [];
      setTransactions(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports().catch(() => {});
  }, []);

  const reportStats = useMemo(() => {
    const totalVolume = transactions.reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0);
    const deposits = transactions.filter((tx) => tx.type === 'deposit').length;
    const withdrawals = transactions.filter((tx) => tx.type === 'withdrawal').length;
    const transfers = transactions.filter((tx) => tx.type === 'transfer').length;

    return [
      { label: 'Volumen procesado', value: formatMoney(totalVolume), icon: BanknotesIcon, tone: 'from-blue-600 to-slate-900' },
      { label: 'Depósitos', value: deposits.toLocaleString('es-GT'), icon: DocumentTextIcon, tone: 'from-emerald-500 to-teal-700' },
      { label: 'Retiros', value: withdrawals.toLocaleString('es-GT'), icon: DocumentMagnifyingGlassIcon, tone: 'from-amber-500 to-orange-700' },
      { label: 'Transferencias', value: transfers.toLocaleString('es-GT'), icon: ChartBarIcon, tone: 'from-indigo-500 to-blue-800' },
    ];
  }, [transactions]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(46,111,212,0.10),_transparent_28%),linear-gradient(180deg,_#f4f8fc_0%,_#edf3f9_100%)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <section className="relative overflow-hidden rounded-md border border-white/70 bg-[linear-gradient(135deg,_#0a2540_0%,_#123b67_55%,_#1a4b8c_100%)] px-6 py-6 text-white shadow-[0_20px_60px_rgba(10,37,64,0.22)] sm:px-8 sm:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(90,156,245,0.28),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(0,196,140,0.16),_transparent_25%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">Reportes</h1>
              <p className="max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
                Consola de reportes operativos y financieros con acceso a indicadores de transacciones.
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
              onClick={loadReports}
            >
              <ArrowPathIcon className="h-4 w-4" />
              Actualizar reportes
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {reportStats.map((item) => (
            <Metric key={item.label} {...item} />
          ))}
        </section>

        <section className="rounded-md border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(10,37,64,0.08)] backdrop-blur">
          {loading ? (
            <div className="flex min-h-[16rem] items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50/80 p-5">
                <h2 className="text-lg font-semibold text-slate-800">Detalle de documentos</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Este módulo puede ampliar exportación a PDF, Excel y filtros por rango de fechas.
                </p>
                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  <p>Transacciones cargadas: {transactions.length.toLocaleString('es-GT')}</p>
                  <p>Fuente: API administrativa</p>
                  <p>Periodo: últimos movimientos disponibles</p>
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50/80 p-5">
                <h2 className="text-lg font-semibold text-slate-800">Siguiente paso</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Aquí se pueden integrar gráficos por producto, ingresos por día y exportación de reportes personalizados.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
