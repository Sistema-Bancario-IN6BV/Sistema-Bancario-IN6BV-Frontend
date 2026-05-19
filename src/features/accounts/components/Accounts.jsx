import React, { useEffect, useMemo, useState } from "react";

import { useAuthStore } from "../../auth/store/authStore";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { Spinner } from "../../../shared/components/layouts/Spinner";

import { useAccountStore } from "../store/useAccountStore";
import { useUserManagmentStore } from "../../users/store/useUserManagmentStore";

import { AccountModal } from "./AccountModal.jsx";
import { useUIStore } from "../../../shared/components/ui/store/uiStore";
import { AccountConfirmDeleteModal } from "./AccountConfirmDeleteModal.jsx";
import { DepositTransactionModal } from "./DepositTransactionModal.jsx";
import "../../../styles/credit-card.css";
import { CreditCardItem } from "./CreditCardItem.jsx";
import {
  PencilSquareIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  PlusIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/outline";
import ConversionModal from '../../../shared/components/ui/ConversionModal';
import { normalizeRole } from "../../../shared/utils/authRole";
import { createTransaction, getAccountsWithMostMovements } from "../../../shared/api/admin";

export const Accounts = () => {
  // SE REMOVIERON LAS DECLARACIONES LOCALES DUPLICADAS DE ACCOUNTS Y LOADING
  const {
    accounts = [],
    loading,
    getAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useAccountStore();

  const { users = [], fetchUsers } = useUserManagmentStore();

  const { user } = useAuthStore();
  const { openConfirm } = useUIStore();
  const normalizedRole = normalizeRole(user?.role);
  const isAdmin = normalizedRole === "ADMIN_ROLE";
  const isClient = normalizedRole === "USER_ROLE";

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [conversionOpen, setConversionOpen] = useState(false);
  const [conversionAccount, setConversionAccount] = useState(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositDestination, setDepositDestination] = useState(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const [orderMode, setOrderMode] = useState('activity-desc');
  const [movementRanking, setMovementRanking] = useState([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    getAccounts().catch((err) => {
       
      console.warn('getAccounts failed:', err);
    });
    fetchUsers().catch((err) => {
       
      console.warn('fetchUsers failed:', err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadRanking = async () => {
      if (!isAdmin || !orderMode.startsWith('activity')) {
        setMovementRanking([]);
        return;
      }

      try {
        setRankingLoading(true);
        const sort = orderMode === 'activity-asc' ? 'asc' : 'desc';
        const res = await getAccountsWithMostMovements(sort);
        const data = res?.data?.data ?? res?.data ?? [];
        setMovementRanking(Array.isArray(data) ? data : []);
      } catch (error) {
         
        console.warn('getAccountsWithMostMovements failed:', error);
        setMovementRanking([]);
      } finally {
        setRankingLoading(false);
      }
    };

    loadRanking().catch(() => {});
  }, [isAdmin, orderMode]);

  const canEditSelected = useMemo(() => {
    if (!selectedAccount) return false;
    if (!user?.id) return false;
    return isAdmin;
  }, [isAdmin, selectedAccount, user?.id]);

  const statusBadgeClass = (status) => {
    if (status === "ACTIVE")
      return "bg-green-400/20 text-green-100 border border-green-300/30";
    if (status === "BLOCKED")
      return "bg-yellow-400/20 text-yellow-100 border border-yellow-300/30";
    if (status === "CLOSED")
      return "bg-red-400/20 text-red-100 border border-red-300/30";

    return "bg-red-400/20 text-red-100 border border-red-300/30";
  };

  const dashboardStats = useMemo(() => {
    const totalAccounts = accounts.length;
    const activeAccounts = accounts.filter((account) => account.status === "ACTIVE").length;
    const blockedAccounts = accounts.filter((account) => account.status === "BLOCKED" || account.status === "CLOSED").length;
    const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);

    return [
      {
        label: "Cuentas registradas",
        value: totalAccounts.toLocaleString(),
        icon: BuildingLibraryIcon,
        tone: "from-blue-600 to-slate-900",
      },
      {
        label: "Saldo consolidado",
        value: `Q ${totalBalance.toLocaleString("es-GT", { maximumFractionDigits: 2 })}`,
        icon: BanknotesIcon,
        tone: "from-emerald-500 to-teal-700",
      },
      {
        label: "Cuentas activas",
        value: `${activeAccounts}/${totalAccounts || 0}`,
        icon: ShieldCheckIcon,
        tone: "from-indigo-500 to-blue-800",
      },
      {
        label: "Bloqueadas",
        value: blockedAccounts.toString(),
        icon: NoSymbolIcon,
        tone: "from-rose-500 to-red-700",
      },
    ];
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    const term = String(searchTerm || "").trim().toLowerCase();
    if (!term) return accounts;

    return accounts.filter((account) => {
      const accNum = String(account.accountNumber ?? account.number ?? "").toLowerCase();
      if (accNum.includes(term)) return true;

      const owner = users.find(
        (u) => u.uid === account.externalUserId || u.id === account.externalUserId
      );

      if (owner) {
        const name = String(owner.name || owner.fullName || owner.username || owner.email || "").toLowerCase();
        if (name.includes(term)) return true;
      }

      return false;
    });
  }, [accounts, users, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginatedAccounts = useMemo(() => {
    const movementCountById = new Map(
      movementRanking.map((item) => [
        String(item?.account?._id || item?.account?.id || ''),
        Number(item?.movementCount || 0),
      ])
    );

    const sortedAccounts = [...filteredAccounts].sort((left, right) => {
      if (orderMode === 'number-asc') {
        return String(left.accountNumber || '').localeCompare(String(right.accountNumber || ''));
      }

      if (orderMode === 'number-desc') {
        return String(right.accountNumber || '').localeCompare(String(left.accountNumber || ''));
      }

      if (orderMode === 'balance-asc') {
        return Number(left.balance || 0) - Number(right.balance || 0);
      }

      if (orderMode === 'balance-desc') {
        return Number(right.balance || 0) - Number(left.balance || 0);
      }

      const leftCount = movementCountById.get(String(left._id || left.id)) || 0;
      const rightCount = movementCountById.get(String(right._id || right.id)) || 0;
      return orderMode === 'activity-asc' ? leftCount - rightCount : rightCount - leftCount;
    });

    const start = (currentPage - 1) * pageSize;
    return sortedAccounts.slice(start, start + pageSize).map((account) => ({
      ...account,
      movementCount: movementRanking.find((item) => String(item?.account?._id || item?.account?.id || '') === String(account._id || account.id))?.movementCount || 0,
    }));
  }, [filteredAccounts, currentPage, pageSize, movementRanking, orderMode]);

  const handleCreateSubmit = async ({ ok, payload, error }) => {
    if (!ok) {
      showError(error || "No se pudo crear la cuenta");
      return;
    }

    if (!isAdmin) {
      showError("Solo administradores pueden crear cuentas");
      return;
    }

    const res = await createAccount(payload);
    if (res?.success) {
      showSuccess("Cuenta creada correctamente");
      setCreateOpen(false);
      setSelectedAccount(null);
      return;
    }

    showError(res?.error || "Error al crear la cuenta");
  };

  const handleEditSubmit = async ({ ok, payload, error }) => {
    if (!ok) {
      showError(error || "No se pudo actualizar la cuenta");
      return;
    }

    if (!selectedAccount) return;

    if (!canEditSelected) {
      showError("No tienes permiso para editar esta cuenta");
      return;
    }

    const accountId = selectedAccount._id ?? selectedAccount.id;
    if (!accountId) {
      showError("ID de cuenta inválido");
      return;
    }

    const res = await updateAccount(accountId, payload);

    if (res?.success) {
      showSuccess("Cuenta actualizada");
      setEditOpen(false);
      setSelectedAccount(null);
      return;
    }

    showError(res?.error || "Error al actualizar la cuenta");
  };

  const handleOpenCreate = () => {
    setSelectedAccount(null);
    setCreateOpen(true);
  };

  const handleOpenEdit = (account) => {
    setSelectedAccount(account);
    setEditOpen(true);
  };

  const handleOpenDeposit = (account) => {
    setDepositDestination(account);
    setDepositOpen(true);
  };

  const handleActivate = (account) => {
    const accountId = account._id ?? account.id;
    if (!accountId) {
      showError("ID de cuenta inválido");
      return;
    }

    if (!isAdmin) {
      showError("Solo admins pueden activar cuentas");
      return;
    }

    openConfirm({
      title: "Activar cuenta",
      message: "Esta acción volverá a habilitar la cuenta con estado ACTIVE. ¿Confirmas?",
      onConfirm: async () => {
        const res = await updateAccount(accountId, { status: "ACTIVE" });
        if (res?.success) {
          showSuccess("Cuenta activada correctamente");
        } else {
          showError(res?.error || "Error al activar la cuenta");
        }
      },
    });
  };

  const handleDeactivate = (account) => {
    const accountId = account._id ?? account.id;
    if (!accountId) {
      showError("ID de cuenta inválido");
      return;
    }

    if (!isAdmin && !(user?.id && account.externalUserId === user.id)) {
      showError("No tienes permiso para desactivar esta cuenta");
      return;
    }

    openConfirm({
      title: "Desactivar cuenta",
      message: "Esta acción desactivará la cuenta (ya no aparecerá en tu lista). ¿Confirmas?",
      onConfirm: async () => {
        const res = await deleteAccount(accountId);
        if (res?.success) {
          showSuccess("Cuenta desactivada correctamente");
        } else {
          showError(res?.error || "Error al desactivar la cuenta");
        }
      },
    }); // CORREGIDO: Se cerró correctamente el objeto de configuración y la llamada
  };

  const handleDepositSubmit = async ({ ok, payload, error }) => {
    if (!ok) {
      showError(error || "No se pudo registrar el depósito");
      return;
    }

    try {
      setDepositLoading(true);
      const res = await createTransaction(payload);

      if (res?.data?.success) {
        showSuccess("Depósito registrado correctamente");
        await getAccounts();
        setDepositOpen(false);
        setDepositDestination(null);
      } else {
        showError(res?.data?.message || "No se pudo registrar el depósito");
      }
    } catch (err) {
      showError(err?.response?.data?.message || err.message || "No se pudo registrar el depósito");
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(46,111,212,0.10),_transparent_28%),linear-gradient(180deg,_#f4f8fc_0%,_#edf3f9_100%)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <section className="relative overflow-hidden rounded-md border border-white/70 bg-[linear-gradient(135deg,_#0a2540_0%,_#123b67_55%,_#1a4b8c_100%)] px-6 py-6 text-white shadow-[0_20px_60px_rgba(10,37,64,0.22)] sm:px-8 sm:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(90,156,245,0.28),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(0,196,140,0.16),_transparent_25%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Cuentas Bancarias
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
                Administra las cuentas del sistema con una vista ejecutiva de saldos, estado y actividad.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 xl:justify-end">
              {isAdmin && (
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow-md hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300"
                  title="Crear nueva cuenta"
                  aria-label="Crear nueva cuenta"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Crear cuenta</span>
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map(({ label, value, icon: Icon, tone }) => (
            <article
              key={label}
              className="group relative overflow-hidden rounded-md border border-white/70 bg-white/90 p-5 shadow-[0_10px_30px_rgba(10,37,64,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(10,37,64,0.12)]"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone}`} />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
                    {value}
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-to-br ${tone} text-white shadow-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-md border border-white/70 bg-white/88 p-4 shadow-[0_18px_50px_rgba(10,37,64,0.08)] backdrop-blur sm:p-6">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar por usuario o número de cuenta..."
                className="w-72 rounded-md border px-3 py-2 text-sm shadow-sm"
              />
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="rounded-md border px-2 py-2 text-sm"
                title="Tamaño de página"
              >
                <option value={6}>6 por página</option>
                <option value={9}>9 por página</option>
                <option value={12}>12 por página</option>
              </select>
              <select
                value={orderMode}
                onChange={(e) => { setOrderMode(e.target.value); setCurrentPage(1); }}
                className="rounded-md border px-2 py-2 text-sm"
                title="Ordenar cuentas"
              >
                <option value="activity-desc">Actividad: mayor a menor</option>
                <option value="activity-asc">Actividad: menor a mayor</option>
                <option value="number-asc">Número de cuenta: asc</option>
                <option value="number-desc">Número de cuenta: desc</option>
                <option value="balance-desc">Saldo: mayor a menor</option>
                <option value="balance-asc">Saldo: menor a mayor</option>
              </select>
            </div>
            <div className="text-sm text-slate-500">
              Resultados: {filteredAccounts.length}
              {orderMode.startsWith('activity') && rankingLoading && ' · cargando actividad...'}
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-12 text-center text-slate-500">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-sm bg-slate-900 text-white shadow-lg shadow-slate-900/20">
                <BuildingLibraryIcon className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">No hay cuentas registradas</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Crea la primera cuenta para que el panel muestre actividad, saldos y movimientos.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {paginatedAccounts.map((account) => {
                const accountId = account._id ?? account.id;
                const accountOwner = users.find(u => u.uid === account.externalUserId || u.id === account.externalUserId);
                const isActiveAccount = account.status === "ACTIVE";
                const canDeactivateAccount = isAdmin || (user?.id && account.externalUserId === user.id && isActiveAccount);
                const canActivateAccount = isAdmin && !isActiveAccount;

                return (
                  <div
                    key={accountId}
                    className="group overflow-hidden rounded-md border border-slate-200/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,251,255,0.96))] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex justify-center px-3 pt-4 pb-2">
                      <div className="max-w-[430px] w-full">
                        <CreditCardItem account={account} accountOwner={accountOwner} statusBadgeClass={statusBadgeClass} />
                      </div>
                    </div>

                    {orderMode.startsWith('activity') && (
                      <div className="px-5 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Movimientos: {account.movementCount || 0}
                      </div>
                    )}

                    <div className="border-t border-slate-200/80 px-5 py-5">
                      <div className="flex flex-wrap gap-3">
                        {(isAdmin || (isClient && account.externalUserId === user?.id)) && (
                          <button
                            className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={(e) => { e.stopPropagation(); setConversionAccount(accountId); setConversionOpen(true); }}
                          >
                            <BanknotesIcon className="w-5 h-5" />
                            Cambio divisas
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                            onClick={(e) => { e.stopPropagation(); handleOpenDeposit(account); }}
                          >
                            <ArrowDownCircleIcon className="w-5 h-5" />
                            Depósito
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(account); }}
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                            Editar
                          </button>
                        )}

                        <div className="flex-1" />

                        {isActiveAccount ? (
                          <button
                            className="flex-1 items-center justify-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 flex"
                            onClick={(e) => { e.stopPropagation(); handleDeactivate(account); }}
                            disabled={!canDeactivateAccount}
                            title={
                              isAdmin
                                ? "Desactivar"
                                : (user?.id && account.externalUserId === user.id) ? 'Desactivar mi cuenta' : 'Solo admins pueden desactivar cuentas'
                            }
                          >
                            <NoSymbolIcon className="w-5 h-5" strokeWidth={2} />
                            Desactivar
                          </button>
                        ) : (
                          <button
                            className="flex-1 items-center justify-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 flex"
                            onClick={(e) => { e.stopPropagation(); handleActivate(account); }}
                            disabled={!canActivateAccount}
                            title={isAdmin ? 'Activar' : 'Solo admins pueden activar cuentas'}
                          >
                            <CheckCircleIcon className="w-5 h-5" strokeWidth={2} />
                            Activar
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredAccounts.length > pageSize && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                className="rounded px-3 py-1 border"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>

              <div className="text-sm text-slate-600">Página {currentPage} de {totalPages}</div>

              <button
                className="rounded px-3 py-1 border"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          )}
        </section>
      </div>

      <AccountModal
        mode="create"
        isOpen={createOpen}
        loading={loading}
        initialValues={null}
        users={users}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <AccountModal
        mode="edit"
        isOpen={editOpen}
        loading={loading}
        initialValues={selectedAccount}
        onClose={() => {
          setEditOpen(false);
          setSelectedAccount(null);
        }}
        onSubmit={handleEditSubmit}
      />

      <AccountConfirmDeleteModal />

      <ConversionModal
        accountId={conversionAccount}
        isOpen={conversionOpen}
        onClose={() => {
          setConversionOpen(false);
          setConversionAccount(null);
        }}
      />

      <DepositTransactionModal
        isOpen={depositOpen}
        onClose={() => {
          setDepositOpen(false);
          setDepositDestination(null);
        }}
        onSubmit={handleDepositSubmit}
        loading={depositLoading}
        accounts={accounts}
        users={users}
        destinationAccount={depositDestination ? (depositDestination._id || depositDestination.id || depositDestination.accountNumber || '') : ''}
      />
    </div>
  );
};

export default Accounts;
