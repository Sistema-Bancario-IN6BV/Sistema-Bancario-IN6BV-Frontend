// Accounts.jsx — REDISEÑO VISUAL ÚNICAMENTE
// Toda la lógica, estados, efectos, API calls, handlers son idénticos al original
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
import { createTransaction, getAccountsWithMostMovements, getAccountByNumber } from "../../../shared/api/admin";
import { resolveAccountReference } from "../../../shared/utils/accountReference";

/* ─── Stat configs ─────────────────────────────────────────── */
const STAT_CONFIGS = {
  "Cuentas registradas": { grad: "linear-gradient(135deg,#4f8ef7,#2563eb)", glow: "rgba(79,142,247,0.35)" },
  "Saldo consolidado":   { grad: "linear-gradient(135deg,#00d4a0,#059669)", glow: "rgba(0,212,160,0.35)"  },
  "Cuentas activas":     { grad: "linear-gradient(135deg,#a78bfa,#7c3aed)", glow: "rgba(167,139,250,0.35)"},
  "Bloqueadas":          { grad: "linear-gradient(135deg,#f87171,#dc2626)", glow: "rgba(248,113,113,0.35)"},
};

/* ─── Glass panel base style ───────────────────────────────── */
const glass = {
  borderRadius:        "16px",
  background:          "rgba(255,255,255,0.04)",
  backdropFilter:      "blur(18px)",
  WebkitBackdropFilter:"blur(18px)",
  border:              "1px solid rgba(255,255,255,0.09)",
  boxShadow:           "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
  overflow:            "hidden",
};

/* ─── Stat Card ────────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon }) => {
  const cfg = STAT_CONFIGS[label] || STAT_CONFIGS["Bloqueadas"];
  return (
    <article
      style={{
        ...glass,
        position:   "relative",
        padding:    "22px 24px",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        cursor:     "default",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform  = "translateY(-3px)";
        e.currentTarget.style.boxShadow  = `0 16px 48px rgba(0,0,0,0.5), ${cfg.glow} 0 0 30px, inset 0 1px 0 rgba(255,255,255,0.08)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform  = "translateY(0)";
        e.currentTarget.style.boxShadow  = "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)";
      }}
    >
      {/* top accent line */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background: cfg.grad, borderRadius:"16px 16px 0 0" }} />
      {/* glow blob */}
      <div style={{ position:"absolute", top:"-20px", right:"-20px", width:"80px", height:"80px", borderRadius:"50%", background: cfg.grad, opacity:0.08, filter:"blur(20px)", pointerEvents:"none" }} />

      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"16px" }}>
        <div>
          <p style={{ fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(232,240,254,0.45)", marginBottom:"8px" }}>
            {label}
          </p>
          <p style={{ fontSize:"1.75rem", fontWeight:700, color:"#e8f0fe", letterSpacing:"-0.02em", lineHeight:1.1 }}>
            {value}
          </p>
        </div>
        <div style={{ width:"46px", height:"46px", borderRadius:"12px", background: cfg.grad, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 6px 20px ${cfg.glow}` }}>
          <Icon style={{ width:"22px", height:"22px", color:"#fff" }} />
        </div>
      </div>
    </article>
  );
};

/* ─── Input / Select shared style ─────────────────────────── */
const inputStyle = {
  padding:         "9px 13px",
  background:      "rgba(255,255,255,0.06)",
  border:          "1px solid rgba(255,255,255,0.12)",
  borderRadius:    "10px",
  color:           "#e8f0fe",
  fontSize:        "0.845rem",
  outline:         "none",
  fontFamily:      "inherit",
  transition:      "border-color 0.2s, box-shadow 0.2s",
};

/* ══════════════════════════════════════════════════════════════
   Accounts — lógica 100% original, solo rediseño visual
   ══════════════════════════════════════════════════════════════ */
export const Accounts = () => {
  // ── Estado y store: idénticos al original ──────────────────
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
  const isAdmin  = normalizedRole === "ADMIN_ROLE";
  const isClient = normalizedRole === "USER_ROLE";

  const [createOpen, setCreateOpen]             = useState(false);
  const [editOpen, setEditOpen]                 = useState(false);
  const [selectedAccount, setSelectedAccount]   = useState(null);
  const [conversionOpen, setConversionOpen]     = useState(false);
  const [conversionAccount, setConversionAccount] = useState(null);
  const [depositOpen, setDepositOpen]           = useState(false);
  const [depositDestination, setDepositDestination] = useState(null);
  const [depositLoading, setDepositLoading]     = useState(false);
  const [orderMode, setOrderMode]               = useState("activity-desc");
  const [movementRanking, setMovementRanking]   = useState([]);
  const [rankingLoading, setRankingLoading]     = useState(false);
  const [searchTerm, setSearchTerm]             = useState("");
  const [currentPage, setCurrentPage]           = useState(1);
  const [pageSize, setPageSize]                 = useState(6);

  // ── Effects: idénticos al original ────────────────────────
  useEffect(() => {
    getAccounts().catch(err  => console.warn("getAccounts failed:", err));
    fetchUsers().catch(err   => console.warn("fetchUsers failed:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadRanking = async () => {
      if (!isAdmin || !orderMode.startsWith("activity")) {
        setMovementRanking([]);
        return;
      }
      try {
        setRankingLoading(true);
        const sort = orderMode === "activity-asc" ? "asc" : "desc";
        const res  = await getAccountsWithMostMovements(sort);
        const data = res?.data?.data ?? res?.data ?? [];
        setMovementRanking(Array.isArray(data) ? data : []);
      } catch (error) {
        console.warn("getAccountsWithMostMovements failed:", error);
        setMovementRanking([]);
      } finally {
        setRankingLoading(false);
      }
    };
    loadRanking().catch(() => {});
  }, [isAdmin, orderMode]);

  // ── Computed values: idénticos al original ─────────────────
  const canEditSelected = useMemo(() => {
    if (!selectedAccount) return false;
    if (!user?.id)        return false;
    return isAdmin;
  }, [isAdmin, selectedAccount, user?.id]);

  const statusBadgeClass = (status) => {
    if (status === "ACTIVE")  return "bg-green-400/20 text-green-100 border border-green-300/30";
    if (status === "BLOCKED") return "bg-yellow-400/20 text-yellow-100 border border-yellow-300/30";
    if (status === "CLOSED")  return "bg-red-400/20 text-red-100 border border-red-300/30";
    return "bg-red-400/20 text-red-100 border border-red-300/30";
  };

  const dashboardStats = useMemo(() => {
    const totalAccounts   = accounts.length;
    const activeAccounts  = accounts.filter(a => a.status === "ACTIVE").length;
    const blockedAccounts = accounts.filter(a => a.status === "BLOCKED" || a.status === "CLOSED").length;
    const totalBalance    = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
    return [
      { label:"Cuentas registradas", value: totalAccounts.toLocaleString(),                                                              icon: BuildingLibraryIcon },
      { label:"Saldo consolidado",   value: `Q ${totalBalance.toLocaleString("es-GT",{ maximumFractionDigits:2 })}`,                     icon: BanknotesIcon       },
      { label:"Cuentas activas",     value: `${activeAccounts}/${totalAccounts || 0}`,                                                   icon: ShieldCheckIcon     },
      { label:"Bloqueadas",          value: blockedAccounts.toString(),                                                                   icon: NoSymbolIcon        },
    ];
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    const term = String(searchTerm || "").trim().toLowerCase();
    if (!term) return accounts;
    return accounts.filter(account => {
      const accNum = String(account.accountNumber ?? account.number ?? "").toLowerCase();
      if (accNum.includes(term)) return true;
      const owner = users.find(u => u.uid === account.externalUserId || u.id === account.externalUserId);
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
      movementRanking.map(item => [
        String(item?.account?._id || item?.account?.id || ""),
        Number(item?.movementCount || 0),
      ])
    );
    const sortedAccounts = [...filteredAccounts].sort((l, r) => {
      if (orderMode === "number-asc")    return String(l.accountNumber || "").localeCompare(String(r.accountNumber || ""));
      if (orderMode === "number-desc")   return String(r.accountNumber || "").localeCompare(String(l.accountNumber || ""));
      if (orderMode === "balance-asc")   return Number(l.balance || 0) - Number(r.balance || 0);
      if (orderMode === "balance-desc")  return Number(r.balance || 0) - Number(l.balance || 0);
      const lc = movementCountById.get(String(l._id || l.id)) || 0;
      const rc = movementCountById.get(String(r._id || r.id)) || 0;
      return orderMode === "activity-asc" ? lc - rc : rc - lc;
    });
    const start = (currentPage - 1) * pageSize;
    return sortedAccounts.slice(start, start + pageSize).map(account => ({
      ...account,
      movementCount: movementRanking.find(item =>
        String(item?.account?._id || item?.account?.id || "") === String(account._id || account.id)
      )?.movementCount || 0,
    }));
  }, [filteredAccounts, currentPage, pageSize, movementRanking, orderMode]);

  // ── Handlers: idénticos al original ───────────────────────
  const handleCreateSubmit = async ({ ok, payload, error }) => {
    if (!ok) { showError(error || "No se pudo crear la cuenta"); return; }
    if (!isAdmin) { showError("Solo administradores pueden crear cuentas"); return; }
    const res = await createAccount(payload);
    if (res?.success) { showSuccess("Cuenta creada correctamente"); setCreateOpen(false); setSelectedAccount(null); return; }
    showError(res?.error || "Error al crear la cuenta");
  };

  const handleEditSubmit = async ({ ok, payload, error }) => {
    if (!ok) { showError(error || "No se pudo actualizar la cuenta"); return; }
    if (!selectedAccount) return;
    if (!canEditSelected) { showError("No tienes permiso para editar esta cuenta"); return; }
    const accountId = selectedAccount._id ?? selectedAccount.id;
    if (!accountId) { showError("ID de cuenta inválido"); return; }
    const res = await updateAccount(accountId, payload);
    if (res?.success) { showSuccess("Cuenta actualizada"); setEditOpen(false); setSelectedAccount(null); return; }
    showError(res?.error || "Error al actualizar la cuenta");
  };

  const handleOpenCreate  = ()        => { setSelectedAccount(null); setCreateOpen(true); };
  const handleOpenEdit    = (account) => { setSelectedAccount(account); setEditOpen(true); };
  const handleOpenDeposit = (account) => { setDepositDestination(account); setDepositOpen(true); };

  const handleActivate = (account) => {
    const accountId = account._id ?? account.id;
    if (!accountId) { showError("ID de cuenta inválido"); return; }
    if (!isAdmin)   { showError("Solo admins pueden activar cuentas"); return; }
    openConfirm({
      title:   "Activar cuenta",
      message: "Esta acción volverá a habilitar la cuenta con estado ACTIVE. ¿Confirmas?",
      onConfirm: async () => {
        const res = await updateAccount(accountId, { status: "ACTIVE" });
        if (res?.success) showSuccess("Cuenta activada correctamente");
        else              showError(res?.error || "Error al activar la cuenta");
      },
    });
  };

  const handleDeactivate = (account) => {
    const accountId = account._id ?? account.id;
    if (!accountId) { showError("ID de cuenta inválido"); return; }
    if (!isAdmin && !(user?.id && account.externalUserId === user.id)) {
      showError("No tienes permiso para desactivar esta cuenta"); return;
    }
    openConfirm({
      title:   "Desactivar cuenta",
      message: "Esta acción desactivará la cuenta (ya no aparecerá en tu lista). ¿Confirmas?",
      onConfirm: async () => {
        const res = await deleteAccount(accountId);
        if (res?.success) showSuccess("Cuenta desactivada correctamente");
        else              showError(res?.error || "Error al desactivar la cuenta");
      },
    });
  };

  const handleDepositSubmit = async ({ ok, payload, error }) => {
    if (!ok) { showError(error || "No se pudo registrar el depósito"); return; }
    try {
      setDepositLoading(true);
      const resolvedDestination = await resolveAccountReference(
        payload?.destinationAccount,
        accounts,
        [],
        async (accountNumber) => {
          const response = await getAccountByNumber(accountNumber);
          return response?.data?.account ?? response?.data ?? null;
        }
      );
      const normalizedPayload = {
        ...payload,
        destinationAccount: resolvedDestination.accountId || payload?.destinationAccount,
      };

      if (!resolvedDestination.accountId) {
        showError("No se pudo resolver la cuenta destino. Verifica el número o usa un ID válido.");
        return;
      }

      const res = await createTransaction(normalizedPayload);
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

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:  "100vh",
      padding:    "clamp(16px,3vw,32px)",
      background: "radial-gradient(ellipse 70% 50% at 10% 0%, rgba(79,142,247,0.07) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 90% 100%, rgba(0,212,160,0.05) 0%, transparent 50%), var(--dash-bg, #070d1a)",
    }}>
      <div style={{ maxWidth:"1440px", margin:"0 auto", display:"flex", flexDirection:"column", gap:"24px" }}>

        {/* ══ Hero ══════════════════════════════════════════════ */}
        <section style={{
          ...glass,
          padding:    "clamp(24px,4vw,40px)",
          position:   "relative",
          background: "linear-gradient(135deg, rgba(10,37,64,0.92) 0%, rgba(26,75,140,0.72) 55%, rgba(79,142,247,0.14) 100%)",
          border:     "1px solid rgba(79,142,247,0.2)",
        }}>
          {/* mesh */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
            background:"radial-gradient(ellipse 55% 70% at 90% 10%, rgba(79,142,247,0.18) 0%, transparent 55%), radial-gradient(ellipse 40% 50% at 10% 90%, rgba(0,212,160,0.10) 0%, transparent 50%)" }} />
          {/* grid texture */}
          <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none",
            backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize:"48px 48px" }} />

          <div style={{ position:"relative", zIndex:1, display:"flex", flexWrap:"wrap", gap:"20px", alignItems:"flex-end", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(79,142,247,0.85)", marginBottom:"10px" }}>
                Gestión Financiera
              </p>
              <h1 style={{
                fontFamily:    '"DM Serif Display", Georgia, serif',
                fontSize:      "clamp(1.8rem,4vw,3rem)",
                fontWeight:    400,
                color:         "#e8f0fe",
                letterSpacing: "-0.02em",
                lineHeight:    1.15,
                marginBottom:  "10px",
              }}>
                Cuentas Bancarias
              </h1>
              <p style={{ fontSize:"0.875rem", color:"rgba(232,240,254,0.5)", maxWidth:"520px", lineHeight:1.7 }}>
                Administra las cuentas del sistema con una vista ejecutiva de saldos, estado y actividad.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenCreate}
                title="Crear nueva cuenta"
                aria-label="Crear nueva cuenta"
                style={{
                  display:        "inline-flex",
                  alignItems:     "center",
                  gap:            "8px",
                  padding:        "12px 22px",
                  borderRadius:   "12px",
                  background:     "rgba(79,142,247,0.15)",
                  border:         "1px solid rgba(79,142,247,0.35)",
                  color:          "#a5c8ff",
                  fontSize:       "0.845rem",
                  fontWeight:     600,
                  letterSpacing:  "0.02em",
                  cursor:         "pointer",
                  backdropFilter: "blur(10px)",
                  transition:     "all 0.2s ease",
                  boxShadow:      "0 4px 20px rgba(79,142,247,0.15)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(79,142,247,0.28)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(79,142,247,0.15)"; e.currentTarget.style.transform="translateY(0)"; }}
              >
                <PlusIcon style={{ width:"16px", height:"16px" }} />
                Crear cuenta
              </button>
            )}
          </div>
        </section>

        {/* ══ Stats ═════════════════════════════════════════════ */}
        <section style={{ display:"grid", gap:"16px", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))" }}>
          {dashboardStats.map(stat => <StatCard key={stat.label} {...stat} />)}
        </section>

        {/* ══ Tabla / Grid ══════════════════════════════════════ */}
        <section style={{ ...glass, padding:"24px 28px" }}>

          {/* Filter bar */}
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:"12px", marginBottom:"20px" }}>
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:"10px" }}>
              {/* Search */}
              <div style={{ position:"relative" }}>
                <svg style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:"rgba(232,240,254,0.3)", pointerEvents:"none" }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar cuenta o usuario…"
                  style={{ ...inputStyle, paddingLeft:"34px", width:"260px" }}
                  onFocus={e  => { e.target.style.borderColor="rgba(79,142,247,0.6)"; e.target.style.boxShadow="0 0 0 3px rgba(79,142,247,0.12)"; }}
                  onBlur={e   => { e.target.style.borderColor="rgba(255,255,255,0.12)"; e.target.style.boxShadow="none"; }}
                />
              </div>

              {/* Page size */}
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                style={{ ...inputStyle, paddingRight:"28px", cursor:"pointer",
                  backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(232,240,254,0.4)' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", appearance:"none" }}
                title="Tamaño de página"
              >
                <option value={6}>6 por página</option>
                <option value={9}>9 por página</option>
                <option value={12}>12 por página</option>
              </select>

              {/* Order */}
              <select
                value={orderMode}
                onChange={e => { setOrderMode(e.target.value); setCurrentPage(1); }}
                style={{ ...inputStyle, paddingRight:"28px", cursor:"pointer",
                  backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(232,240,254,0.4)' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", appearance:"none" }}
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

            {/* Result count */}
            <div style={{ fontSize:"0.78rem", color:"rgba(232,240,254,0.38)", letterSpacing:"0.04em" }}>
              {filteredAccounts.length} resultado{filteredAccounts.length !== 1 ? "s" : ""}
              {orderMode.startsWith("activity") && rankingLoading && " · cargando actividad…"}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ display:"flex", justifyContent:"center", padding:"64px 0" }}>
              <Spinner />
            </div>
          ) : accounts.length === 0 ? (
            <div style={{
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              borderRadius:"14px", border:"1px dashed rgba(255,255,255,0.1)", padding:"64px 24px",
              background:"rgba(255,255,255,0.02)", textAlign:"center",
            }}>
              <div style={{ width:"56px", height:"56px", borderRadius:"14px", background:"rgba(79,142,247,0.15)", border:"1px solid rgba(79,142,247,0.25)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"16px" }}>
                <BuildingLibraryIcon style={{ width:"28px", height:"28px", color:"#4f8ef7" }} />
              </div>
              <h2 style={{ fontSize:"1.1rem", fontWeight:700, color:"#e8f0fe", marginBottom:"8px" }}>No hay cuentas registradas</h2>
              <p style={{ fontSize:"0.845rem", color:"rgba(232,240,254,0.38)", maxWidth:"400px", lineHeight:1.7 }}>
                Crea la primera cuenta para que el panel muestre actividad, saldos y movimientos.
              </p>
            </div>
          ) : (
            <div style={{ display:"grid", gap:"16px", gridTemplateColumns:"repeat(auto-fill, minmax(340px,1fr))" }}>
              {paginatedAccounts.map(account => {
                const accountId          = account._id ?? account.id;
                const accountOwner       = users.find(u => u.uid === account.externalUserId || u.id === account.externalUserId);
                const isActiveAccount    = account.status === "ACTIVE";
                const canDeactivateAccount = isAdmin || (user?.id && account.externalUserId === user.id && isActiveAccount);
                const canActivateAccount = isAdmin && !isActiveAccount;

                return (
                  <div
                    key={accountId}
                    style={{
                      borderRadius:        "16px",
                      background:          "rgba(255,255,255,0.04)",
                      backdropFilter:      "blur(14px)",
                      WebkitBackdropFilter:"blur(14px)",
                      border:              "1px solid rgba(255,255,255,0.09)",
                      boxShadow:           "0 4px 24px rgba(0,0,0,0.35)",
                      overflow:            "hidden",
                      transition:          "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,142,247,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="0 4px 24px rgba(0,0,0,0.35)"; }}
                  >
                    {/* Credit card */}
                    <div style={{ display:"flex", justifyContent:"center", padding:"16px 16px 8px" }}>
                      <div style={{ maxWidth:"430px", width:"100%" }}>
                        <CreditCardItem account={account} accountOwner={accountOwner} statusBadgeClass={statusBadgeClass} />
                      </div>
                    </div>

                    {/* Movement badge */}
                    {orderMode.startsWith("activity") && (
                      <div style={{ padding:"4px 20px 8px", display:"flex", alignItems:"center", gap:"6px" }}>
                        <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#4f8ef7" }} />
                        <span style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(232,240,254,0.4)" }}>
                          {account.movementCount || 0} movimiento{(account.movementCount || 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", padding:"16px 20px" }}>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>

                        {/* Cambio divisas */}
                        {(isAdmin || (isClient && account.externalUserId === user?.id)) && (
                          <ActionBtn
                            icon={<BanknotesIcon style={{ width:"15px", height:"15px" }} />}
                            label="Divisas"
                            color="rgba(167,139,250,0.18)"
                            border="rgba(167,139,250,0.3)"
                            textColor="#c4b5fd"
                            hoverBg="rgba(167,139,250,0.3)"
                            onClick={e => { e.stopPropagation(); setConversionAccount(accountId); setConversionOpen(true); }}
                          />
                        )}

                        {/* Depósito */}
                        {isAdmin && (
                          <ActionBtn
                            icon={<ArrowDownCircleIcon style={{ width:"15px", height:"15px" }} />}
                            label="Depósito"
                            color="rgba(0,212,160,0.14)"
                            border="rgba(0,212,160,0.28)"
                            textColor="#00d4a0"
                            hoverBg="rgba(0,212,160,0.28)"
                            onClick={e => { e.stopPropagation(); handleOpenDeposit(account); }}
                          />
                        )}

                        {/* Editar */}
                        {isAdmin && (
                          <ActionBtn
                            icon={<PencilSquareIcon style={{ width:"15px", height:"15px" }} />}
                            label="Editar"
                            color="rgba(79,142,247,0.14)"
                            border="rgba(79,142,247,0.28)"
                            textColor="#a5c8ff"
                            hoverBg="rgba(79,142,247,0.28)"
                            onClick={e => { e.stopPropagation(); handleOpenEdit(account); }}
                          />
                        )}

                        <div style={{ flex:1 }} />

                        {/* Activar / Desactivar */}
                        {isActiveAccount ? (
                          <ActionBtn
                            icon={<NoSymbolIcon style={{ width:"15px", height:"15px" }} />}
                            label="Desactivar"
                            color="rgba(248,113,113,0.12)"
                            border="rgba(248,113,113,0.28)"
                            textColor="#f87171"
                            hoverBg="rgba(248,113,113,0.25)"
                            disabled={!canDeactivateAccount}
                            onClick={e => { e.stopPropagation(); handleDeactivate(account); }}
                            title={isAdmin ? "Desactivar" : (user?.id && account.externalUserId === user.id) ? "Desactivar mi cuenta" : "Solo admins pueden desactivar cuentas"}
                          />
                        ) : (
                          <ActionBtn
                            icon={<CheckCircleIcon style={{ width:"15px", height:"15px" }} />}
                            label="Activar"
                            color="rgba(0,212,160,0.12)"
                            border="rgba(0,212,160,0.28)"
                            textColor="#00d4a0"
                            hoverBg="rgba(0,212,160,0.25)"
                            disabled={!canActivateAccount}
                            onClick={e => { e.stopPropagation(); handleActivate(account); }}
                            title={isAdmin ? "Activar" : "Solo admins pueden activar cuentas"}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {filteredAccounts.length > pageSize && (
            <div style={{ marginTop:"24px", display:"flex", alignItems:"center", justifyContent:"center", gap:"12px" }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding:"8px 18px", borderRadius:"10px", fontSize:"0.8rem", fontWeight:600,
                  background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
                  color: currentPage === 1 ? "rgba(232,240,254,0.25)" : "#a5c8ff",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  transition:"all 0.18s",
                }}
              >
                ← Anterior
              </button>

              <span style={{ fontSize:"0.8rem", fontWeight:600, color:"rgba(232,240,254,0.45)", padding:"0 4px" }}>
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding:"8px 18px", borderRadius:"10px", fontSize:"0.8rem", fontWeight:600,
                  background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
                  color: currentPage === totalPages ? "rgba(232,240,254,0.25)" : "#a5c8ff",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  transition:"all 0.18s",
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ── Modales: idénticos al original ────────────────────── */}
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
        onClose={() => { setEditOpen(false); setSelectedAccount(null); }}
        onSubmit={handleEditSubmit}
      />

      <AccountConfirmDeleteModal />

      <ConversionModal
        accountId={conversionAccount}
        isOpen={conversionOpen}
        onClose={() => { setConversionOpen(false); setConversionAccount(null); }}
      />

      <DepositTransactionModal
        isOpen={depositOpen}
        onClose={() => { setDepositOpen(false); setDepositDestination(null); }}
        onSubmit={handleDepositSubmit}
        loading={depositLoading}
        accounts={accounts}
        users={users}
        destinationAccount={depositDestination ? (depositDestination._id || depositDestination.id || depositDestination.accountNumber || "") : ""}
      />
    </div>
  );
};

/* ─── ActionBtn helper ─────────────────────────────────────── */
const ActionBtn = ({ icon, label, color, border, textColor, hoverBg, onClick, disabled, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      display:"inline-flex", alignItems:"center", gap:"6px",
      padding:"7px 14px", borderRadius:"9px",
      background: color, border:`1px solid ${border}`, color: textColor,
      fontSize:"0.78rem", fontWeight:600, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1, transition:"all 0.18s ease",
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = hoverBg; }}
    onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = color; }}
  >
    {icon}
    {label}
  </button>
);

export default Accounts;