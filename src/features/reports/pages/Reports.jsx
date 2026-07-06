import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Spinner } from '../../../shared/components/layouts/Spinner.jsx';
import { ReportMetric } from '../components/ReportMetric.jsx';
import { useReports } from '../hooks/useReports.js';

export const Reports = () => {
  const { transactions, loading, reportStats, loadReports } = useReports();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(46,111,212,0.10),_transparent_28%),linear-gradient(180deg,_#f4f8fc_0%,_#edf3f9_100%)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">

        {/* Hero */}
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

        {/* Métricas */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {reportStats.map(item => <ReportMetric key={item.label} {...item} />)}
        </section>

        {/* Detalle */}
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
