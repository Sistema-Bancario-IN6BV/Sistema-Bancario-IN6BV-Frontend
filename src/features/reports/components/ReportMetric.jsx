import React from 'react';

export const ReportMetric = ({ label, value, icon: Icon, tone }) => (
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
