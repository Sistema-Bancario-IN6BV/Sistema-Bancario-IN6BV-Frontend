import React, { useEffect, useMemo, useState } from 'react';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { useUserManagmentStore } from '../../users/store/useUserManagmentStore';
import {
  getTransactions,
  getAccountRequests,
  approveAccountRequest,
  rejectAccountRequest,
} from '../../../shared/api/admin';
import { showError, showSuccess } from '../../../shared/utils/toast';
import { Spinner } from '../../../shared/components/layouts/Spinner.jsx';
import {
  ArrowPathIcon,
  UsersIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const dayLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

const formatMoney = (value) => `Q ${Number(value || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const aggregateByDay = (transactions = []) => {
  const totals = new Map(dayLabels.map((label) => [label, 0]));

  transactions.forEach((tx) => {
    const date = tx?.createdAt || tx?.date || tx?.created_at;
    if (!date) return;

    const dayIndex = new Date(date).getDay();
    const normalizedDay = dayIndex === 0 ? 6 : dayIndex - 1;
    const label = dayLabels[normalizedDay];
    totals.set(label, (totals.get(label) || 0) + Math.abs(Number(tx?.amount || 0)));
  });

  return dayLabels.map((label) => ({ label, value: totals.get(label) || 0 }));
};

const StatCard = ({ label, value, icon: Icon, tone }) => (
  <article className="group relative overflow-hidden rounded-md border border-white/70 bg-white/90 p-5 shadow-[0_10px_30px_rgba(10,37,64,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(10,37,64,0.12)]">
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone}`} />
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">{value}</p>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-to-br ${tone} text-white shadow-lg`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </article>
);

export const AdminDashboard = () => {
  const { accounts = [], loading: accountsLoading, getAccounts } = useAccountStore();
  const { users = [], fetchUsers, loading: usersLoading } = useUserManagmentStore();
  const [transactions, setTransactions] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = React.useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const res = await getTransactions({ limit: 100 });
      const data = res.data?.transactions ?? res.data?.transaction ?? res.data ?? [];
      setTransactions(Array.isArray(data) ? data : []);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await getAccountRequests();
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

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dashboardStats = useMemo(() => {
    const activeAccounts = accounts.filter((account) => account.status === 'ACTIVE').length;
    const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
    const totalTransactions = transactions.length;
    const todayTransactions = transactions.filter((tx) => {
      const date = tx?.createdAt || tx?.date || tx?.created_at;
      if (!date) return false;
      return new Date(date).toDateString() === new Date().toDateString();
    }).length;

    return [
      { label: 'Usuarios', value: users.length.toLocaleString('es-GT'), icon: UsersIcon, tone: 'from-blue-600 to-slate-900' },
      { label: 'Cuentas', value: accounts.length.toLocaleString('es-GT'), icon: BuildingLibraryIcon, tone: 'from-emerald-500 to-teal-700' },
      { label: 'Transacciones', value: totalTransactions.toLocaleString('es-GT'), icon: CreditCardIcon, tone: 'from-indigo-500 to-blue-800' },
      { label: 'Saldo Total', value: formatMoney(totalBalance), icon: BanknotesIcon, tone: 'from-amber-500 to-orange-700' },
      { label: 'Cuentas Activas', value: activeAccounts.toLocaleString('es-GT'), icon: ClockIcon, tone: 'from-rose-500 to-red-700' },
      { label: 'Hoy', value: todayTransactions.toLocaleString('es-GT'), icon: CalendarDaysIcon, tone: 'from-slate-600 to-slate-900' },
    ];
  }, [accounts, transactions, users.length]);

  const dailySeries = useMemo(() => aggregateByDay(transactions), [transactions]);
  const peakValue = Math.max(...dailySeries.map((item) => item.value), 1);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(46,111,212,0.10),_transparent_28%),linear-gradient(180deg,_#f4f8fc_0%,_#edf3f9_100%)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <section className="relative overflow-hidden rounded-md border border-white/70 bg-[linear-gradient(135deg,_#0a2540_0%,_#123b67_55%,_#1a4b8c_100%)] px-6 py-6 text-white shadow-[0_20px_60px_rgba(10,37,64,0.22)] sm:px-8 sm:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(90,156,245,0.28),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(0,196,140,0.16),_transparent_25%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">Dashboard Bancario</h1>
              <p className="max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
                Resumen operativo del sistema con usuarios, cuentas, transacciones y comportamiento diario.
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
              onClick={refreshAll}
            >
              <ArrowPathIcon className="h-4 w-4" />
              Actualizar
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-md border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(10,37,64,0.08)] backdrop-blur">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <ChartBarIcon className="h-5 w-5 text-blue-600" />
                Transacciones por día
              </h2>
              <span className="text-xs font-medium text-slate-500">Últimos movimientos cargados</span>
            </div>

            {loadingTransactions ? (
              <div className="flex min-h-[18rem] items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="flex h-[18rem] items-end gap-4 rounded-md bg-slate-50/80 p-5">
                {dailySeries.map((item) => {
                  const height = Math.max((item.value / peakValue) * 100, item.value > 0 ? 10 : 4);
                  return (
                    <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-3">
                      <div className="flex h-full w-full items-end justify-center">
                        <div
                          className="w-full max-w-[3.5rem] rounded-t-2xl bg-gradient-to-t from-blue-600 to-cyan-400 shadow-[0_12px_24px_rgba(15,123,223,0.25)] transition-all duration-300 hover:from-blue-500 hover:to-cyan-300"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-slate-600">{item.label}</p>
                        <p className="text-[11px] text-slate-400">{formatMoney(item.value)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-md border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(10,37,64,0.08)] backdrop-blur">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <UsersIcon className="h-5 w-5 text-blue-600" />
                  Solicitudes de cuenta
                </h2>
                <button className="text-xs font-medium text-blue-600 hover:underline" onClick={loadRequests}>
                  Refrescar
                </button>
              </div>

              {loadingRequests ? (
                <div className="flex min-h-[10rem] items-center justify-center">
                  <Spinner />
                </div>
              ) : accountRequests.filter((request) => request.status === 'PENDING').length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-500">
                  No hay solicitudes pendientes.
                </div>
              ) : (
                <div className="space-y-3">
                  {accountRequests
                    .filter((request) => request.status === 'PENDING')
                    .map((request) => {
                      const requester = users.find((user) => user.id === request.externalUserId || user.uid === request.externalUserId);

                      return (
                        <div key={request._id || request.id} className="rounded-md border border-slate-200 bg-slate-50/80 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">{requester ? `${requester.name || ''} ${requester.surname || ''}`.trim() : 'Usuario sin perfil'}</p>
                              <p className="text-xs text-slate-500">ID: {request.externalUserId}</p>
                              <p className="text-xs text-slate-400">
                                Solicitud: {new Date(request.createdAt).toLocaleString('es-GT')}
                              </p>
                            </div>
                            <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                              Pendiente
                            </span>
                          </div>

                          <div className="mt-4 flex gap-3">
                            <button
                              className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                              onClick={async () => {
                                const res = await approveAccountRequest(request._id || request.id);
                                if (res?.data?.success) {
                                  showSuccess('Cuenta aprobada y creada correctamente');
                                  refreshAll();
                                } else {
                                  showError(res?.data?.message || 'No se pudo aprobar la solicitud');
                                }
                              }}
                            >
                              Aprobar
                            </button>
                            <button
                              className="flex-1 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
                              onClick={async () => {
                                const res = await rejectAccountRequest(request._id || request.id);
                                if (res?.data?.success) {
                                  showSuccess('Solicitud rechazada');
                                  refreshAll();
                                } else {
                                  showError(res?.data?.message || 'No se pudo rechazar la solicitud');
                                }
                              }}
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="rounded-md border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(10,37,64,0.08)] backdrop-blur">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
                <UsersIcon className="h-5 w-5 text-blue-600" />
                Estado de carga
              </h2>
              <div className="space-y-4 text-sm text-slate-600">
                <p>Usuarios: {usersLoading ? 'cargando...' : users.length}</p>
                <p>Cuentas: {accountsLoading ? 'cargando...' : accounts.length}</p>
                <p>Transacciones: {loadingTransactions ? 'cargando...' : transactions.length}</p>
              </div>
            </div>

            <div className="rounded-md border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(10,37,64,0.08)] backdrop-blur">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
                <BanknotesIcon className="h-5 w-5 text-blue-600" />
                Resumen financiero
              </h2>
              <div className="space-y-3 text-sm text-slate-600">
                <p>Total balance consolidado y operativa general.</p>
                <p>Este espacio puede ampliarse con alertas de riesgo, top clientes y saldos por producto.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
