// Transactions.jsx — REDISEÑO VISUAL ÚNICAMENTE
// Toda la lógica, estados, efectos, API calls, handlers son idénticos al original
import React, { useState, useEffect, useMemo } from 'react';
import { getTransactions, revertTransaction } from '../../../shared/api/admin';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { Spinner } from "../../../shared/components/layouts/Spinner.jsx";
import { normalizeRole } from '../../../shared/utils/authRole';
import { useAuthStore } from '../../auth/store/authStore';
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CreditCardIcon
} from "@heroicons/react/24/outline";

/* ─── Helpers: idénticos al original ──────────────────────── */
const getTransactionType = (type) => {
  const types = { transfer:'Transferencia', deposit:'Depósito', withdrawal:'Retiro', payment:'Pago' };
  return types[type] || type;
};

/* ─── Design tokens ────────────────────────────────────────── */
const glass = {
  borderRadius:        "16px",
  background:          "rgba(255,255,255,0.04)",
  backdropFilter:      "blur(18px)",
  WebkitBackdropFilter:"blur(18px)",
  border:              "1px solid rgba(255,255,255,0.09)",
  boxShadow:           "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
  overflow:            "hidden",
};

const STAT_CONFIGS = {
  "Volumen Total":    { grad:"linear-gradient(135deg,#4f8ef7,#2563eb)", glow:"rgba(79,142,247,0.35)"  },
  "Flujo Neto":       { grad:"linear-gradient(135deg,#00d4a0,#059669)", glow:"rgba(0,212,160,0.35)"   },
  "Pendientes":       { grad:"linear-gradient(135deg,#fbbf24,#d97706)", glow:"rgba(251,191,36,0.35)"  },
  "Total Movimientos":{ grad:"linear-gradient(135deg,#a78bfa,#7c3aed)", glow:"rgba(167,139,250,0.35)" },
};

/* ─── Type configs ─────────────────────────────────────────── */
const TX_TYPE = {
  deposit:    { bg:"rgba(0,212,160,0.14)",   color:"#00d4a0",  border:"rgba(0,212,160,0.28)"   },
  withdrawal: { bg:"rgba(248,113,113,0.14)", color:"#f87171",  border:"rgba(248,113,113,0.28)" },
  transfer:   { bg:"rgba(79,142,247,0.14)",  color:"#a5c8ff",  border:"rgba(79,142,247,0.28)"  },
  payment:    { bg:"rgba(251,191,36,0.14)",  color:"#fbbf24",  border:"rgba(251,191,36,0.28)"  },
};

/* ─── Status badge ─────────────────────────────────────────── */
const statusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'approved': return { bg:"rgba(0,212,160,0.15)",  color:"#00d4a0", border:"rgba(0,212,160,0.3)"   };
    case 'pending':  return { bg:"rgba(251,191,36,0.15)", color:"#fbbf24", border:"rgba(251,191,36,0.3)"  };
    case 'rejected':
    case 'failed':   return { bg:"rgba(248,113,113,0.15)",color:"#f87171", border:"rgba(248,113,113,0.3)" };
    default:         return { bg:"rgba(255,255,255,0.08)", color:"rgba(232,240,254,0.5)", border:"rgba(255,255,255,0.12)" };
  }
};

/* ─── Stat Card ────────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon }) => {
  const cfg = STAT_CONFIGS[label] || STAT_CONFIGS["Volumen Total"];
  return (
    <article
      style={{ ...glass, position:"relative", padding:"22px 24px", transition:"transform 0.22s ease, box-shadow 0.22s ease", cursor:"default" }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 16px 48px rgba(0,0,0,0.5), ${cfg.glow} 0 0 30px, inset 0 1px 0 rgba(255,255,255,0.08)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)"; }}
    >
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:cfg.grad, borderRadius:"16px 16px 0 0" }} />
      <div style={{ position:"absolute", top:"-20px", right:"-20px", width:"80px", height:"80px", borderRadius:"50%", background:cfg.grad, opacity:0.08, filter:"blur(20px)", pointerEvents:"none" }} />
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"16px" }}>
        <div>
          <p style={{ fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(232,240,254,0.45)", marginBottom:"8px" }}>{label}</p>
          <p style={{ fontSize:"1.75rem", fontWeight:700, color:"#e8f0fe", letterSpacing:"-0.02em", lineHeight:1.1 }}>{value}</p>
        </div>
        <div style={{ width:"46px", height:"46px", borderRadius:"12px", background:cfg.grad, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 6px 20px ${cfg.glow}` }}>
          <Icon style={{ width:"22px", height:"22px", color:"#fff" }} />
        </div>
      </div>
    </article>
  );
};

/* ══════════════════════════════════════════════════════════════
   Transactions — lógica 100% original, solo rediseño visual
   ══════════════════════════════════════════════════════════════ */
export const Transactions = () => {
  // ── Estado: idéntico al original ──────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [revertingId, setRevertingId]   = useState(null);
  const role    = normalizeRole(useAuthStore(state => state.user?.role));
  const isAdmin = role === 'ADMIN_ROLE';

  useEffect(() => { loadTransactions(); }, []);

  const normalizeType = (type) => String(type || '').toLowerCase();

  const canRevertTransaction = (tx) => {
    if (!isAdmin) return false;
    const type = normalizeType(tx.type);
    if (!['deposit', 'transfer'].includes(type)) return false;
    if (tx.reverted) return false;
    const createdAt = tx.createdAt || tx.date;
    if (!createdAt) return false;
    return (Date.now() - new Date(createdAt).getTime()) <= 60_000;
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res  = await getTransactions({ limit: 50 });
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
    const netFlow     = transactions.reduce((sum, tx) =>
      normalizeType(tx.type) === 'deposit' ? sum + tx.amount : sum - tx.amount, 0);
    const pendingCount = transactions.filter(tx => tx.status === 'pending').length;
    return [
      { label:"Volumen Total",     value:`Q ${totalVolume.toLocaleString(undefined,{maximumFractionDigits:2})}`, icon:CurrencyDollarIcon  },
      { label:"Flujo Neto",        value:`Q ${netFlow.toLocaleString(undefined,{maximumFractionDigits:2})}`,     icon:ArrowTrendingUpIcon },
      { label:"Pendientes",        value: pendingCount,                                                          icon:ClockIcon           },
      { label:"Total Movimientos", value: transactions.length,                                                   icon:CreditCardIcon      },
    ];
  }, [transactions]);

  const handleRevert = async (transactionId) => {
    try {
      setRevertingId(transactionId);
      const res = await revertTransaction(transactionId);
      if (res?.data?.success) { showSuccess('Transacción revertida correctamente'); await loadTransactions(); }
      else showError(res?.data?.message || 'No se pudo revertir la transacción');
    } catch (error) {
      showError(error?.response?.data?.message || error.message || 'No se pudo revertir la transacción');
    } finally {
      setRevertingId(null);
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
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
            background:"radial-gradient(ellipse 55% 70% at 90% 10%, rgba(79,142,247,0.18) 0%, transparent 55%), radial-gradient(ellipse 40% 50% at 10% 90%, rgba(0,212,160,0.10) 0%, transparent 50%)" }} />
          <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none",
            backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize:"48px 48px" }} />

          <div style={{ position:"relative", zIndex:1, display:"flex", flexWrap:"wrap", gap:"20px", alignItems:"flex-end", justifyContent:"space-between" }}>
            <div>
              {/* Pill badge */}
              <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"5px 12px", borderRadius:"999px",
                background:"rgba(79,142,247,0.12)", border:"1px solid rgba(79,142,247,0.25)", marginBottom:"12px" }}>
                <CreditCardIcon style={{ width:"13px", height:"13px", color:"rgba(79,142,247,0.85)" }} />
                <span style={{ fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(79,142,247,0.85)" }}>
                  Auditoría Financiera
                </span>
              </div>
              <h1 style={{
                fontFamily:    '"DM Serif Display", Georgia, serif',
                fontSize:      "clamp(1.8rem,4vw,3rem)",
                fontWeight:    400,
                color:         "#e8f0fe",
                letterSpacing: "-0.02em",
                lineHeight:    1.15,
                marginBottom:  "10px",
              }}>
                Historial de Transacciones
              </h1>
              <p style={{ fontSize:"0.875rem", color:"rgba(232,240,254,0.5)", maxWidth:"520px", lineHeight:1.7 }}>
                Monitoreo detallado de todos los movimientos financieros, depósitos y transferencias procesadas por el sistema.
              </p>
            </div>

            <button
              onClick={loadTransactions}
              disabled={loading}
              style={{
                display:"inline-flex", alignItems:"center", gap:"8px",
                padding:"12px 22px", borderRadius:"12px",
                background:"rgba(79,142,247,0.15)", border:"1px solid rgba(79,142,247,0.35)",
                color:"#a5c8ff", fontSize:"0.845rem", fontWeight:600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                backdropFilter:"blur(10px)", transition:"all 0.2s ease",
                boxShadow:"0 4px 20px rgba(79,142,247,0.15)",
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background="rgba(79,142,247,0.28)"; e.currentTarget.style.transform="translateY(-2px)"; } }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(79,142,247,0.15)"; e.currentTarget.style.transform="translateY(0)"; }}
            >
              <ArrowPathIcon style={{ width:"16px", height:"16px" }} />
              {loading ? "Cargando…" : "Actualizar Datos"}
            </button>
          </div>
        </section>

        {/* ══ Stats ═════════════════════════════════════════════ */}
        <section style={{ display:"grid", gap:"16px", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))" }}>
          {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
        </section>

        {/* ══ Table ═════════════════════════════════════════════ */}
        <section style={{ ...glass, padding:"24px 28px" }}>
          {loading ? (
            <div style={{ display:"flex", justifyContent:"center", padding:"64px 0" }}>
              <Spinner />
            </div>
          ) : transactions.length === 0 ? (
            <div style={{
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              borderRadius:"14px", border:"1px dashed rgba(255,255,255,0.1)", padding:"64px 24px",
              background:"rgba(255,255,255,0.02)", textAlign:"center",
            }}>
              <div style={{ width:"56px", height:"56px", borderRadius:"14px", background:"rgba(79,142,247,0.15)", border:"1px solid rgba(79,142,247,0.25)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"16px" }}>
                <CreditCardIcon style={{ width:"28px", height:"28px", color:"#4f8ef7" }} />
              </div>
              <h2 style={{ fontSize:"1.1rem", fontWeight:700, color:"#e8f0fe", marginBottom:"8px" }}>No hay transacciones registradas</h2>
              <p style={{ fontSize:"0.845rem", color:"rgba(232,240,254,0.38)", maxWidth:"400px", lineHeight:1.7 }}>
                El historial de movimientos se encuentra vacío. Realice la primera operación para verla aquí.
              </p>
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.875rem" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                    {["Tipo", "Fecha", "Monto", "Referencia", "Estado"].map((h, i) => (
                      <th key={h} style={{
                        padding:"12px 16px",
                        textAlign: i === 4 ? "right" : "left",
                        fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.14em",
                        textTransform:"uppercase", color:"rgba(232,240,254,0.35)",
                        whiteSpace:"nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => {
                    const typeKey = normalizeType(tx.type);
                    const tc      = TX_TYPE[typeKey] || TX_TYPE.transfer;
                    const sc      = statusStyle(tx.status);
                    const isEven  = idx % 2 === 0;

                    return (
                      <tr
                        key={tx.id}
                        style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background: isEven ? "transparent" : "rgba(255,255,255,0.015)", transition:"background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background="rgba(79,142,247,0.05)"}
                        onMouseLeave={e => e.currentTarget.style.background= isEven ? "transparent" : "rgba(255,255,255,0.015)"}
                      >
                        {/* Tipo */}
                        <td style={{ padding:"14px 16px" }}>
                          <div style={{ display:"inline-flex", alignItems:"center", gap:"8px" }}>
                            <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:tc.bg, border:`1px solid ${tc.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                              <span style={{ fontSize:"10px", fontWeight:800, color:tc.color }}>
                                {tx.type[0].toUpperCase()}
                              </span>
                            </div>
                            <span style={{ fontWeight:600, color:"#e8f0fe" }}>{getTransactionType(tx.type)}</span>
                          </div>
                        </td>

                        {/* Fecha */}
                        <td style={{ padding:"14px 16px", color:"rgba(232,240,254,0.45)", fontSize:"0.82rem" }}>
                          {new Date(tx.date).toLocaleDateString('es-GT', { day:'2-digit', month:'short', year:'numeric' })}
                        </td>

                        {/* Monto */}
                        <td style={{ padding:"14px 16px" }}>
                          <span style={{ fontWeight:700, color: typeKey === 'deposit' ? "#00d4a0" : "#e8f0fe", fontSize:"0.9rem" }}>
                            Q {tx.amount.toFixed(2)}
                          </span>
                        </td>

                        {/* Referencia */}
                        <td style={{ padding:"14px 16px" }}>
                          <span style={{ fontFamily:"monospace", fontSize:"0.75rem", color:"rgba(232,240,254,0.3)", letterSpacing:"0.04em" }}>
                            {tx.reference || '—'}
                          </span>
                        </td>

                        {/* Estado + revert */}
                        <td style={{ padding:"14px 16px", textAlign:"right" }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:"8px" }}>
                            <span style={{
                              display:"inline-flex", alignItems:"center",
                              padding:"4px 10px", borderRadius:"999px",
                              fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
                              background: sc.bg, color: sc.color, border:`1px solid ${sc.border}`,
                            }}>
                              {tx.status}
                            </span>

                            {canRevertTransaction(tx) && (
                              <button
                                onClick={() => handleRevert(tx.id)}
                                disabled={revertingId === tx.id}
                                style={{
                                  padding:"5px 12px", borderRadius:"8px", fontSize:"0.72rem", fontWeight:700, cursor:"pointer",
                                  background:"rgba(248,113,113,0.12)", border:"1px solid rgba(248,113,113,0.28)", color:"#f87171",
                                  opacity: revertingId === tx.id ? 0.6 : 1, transition:"all 0.18s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background="rgba(248,113,113,0.25)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background="rgba(248,113,113,0.12)"; }}
                              >
                                {revertingId === tx.id ? "Revirtiendo…" : "Revertir"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && transactions.length > 0 && (
            <div style={{ marginTop:"20px", paddingTop:"16px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:"0.75rem", color:"rgba(232,240,254,0.3)", letterSpacing:"0.06em" }}>
                {transactions.length} transacciones registradas
              </span>
              <div style={{ display:"flex", gap:"6px" }}>
                {["deposit","withdrawal","transfer","payment"].map(t => {
                  const c = TX_TYPE[t];
                  return (
                    <div key={t} style={{ display:"inline-flex", alignItems:"center", gap:"4px" }}>
                      <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:c.color }} />
                      <span style={{ fontSize:"0.68rem", color:"rgba(232,240,254,0.3)", textTransform:"capitalize" }}>{t}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Transactions;