import { useEffect, useState } from "react";
import { XMarkIcon, ArrowDownCircleIcon } from "@heroicons/react/24/outline";

const overlay = {
  position: "fixed", inset: 0,
  background: "rgba(4,8,20,0.75)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 50, padding: "16px",
};

const modalBox = {
  background: "rgba(12,20,40,0.95)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "18px",
  width: "100%",
  maxWidth: "460px",
  overflow: "hidden",
  boxShadow: "0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
};

const inputStyle = {
  width: "100%", padding: "10px 13px",
  background: "rgba(255,255,255,0.06)",
  border: "1.5px solid rgba(255,255,255,0.12)",
  borderRadius: "10px",
  color: "#e8f0fe",
  fontSize: "0.875rem",
  fontFamily: "inherit",
  outline: "none",
};

const labelStyle = {
  fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em",
  textTransform: "uppercase", color: "rgba(232,240,254,0.4)",
  marginBottom: "6px", display: "block",
};

const focusInput = e => { e.target.style.borderColor="rgba(0,212,160,0.6)"; e.target.style.boxShadow="0 0 0 3px rgba(0,212,160,0.12)"; e.target.style.background="rgba(255,255,255,0.09)"; };
const blurInput  = e => { e.target.style.borderColor="rgba(255,255,255,0.12)"; e.target.style.boxShadow="none"; e.target.style.background="rgba(255,255,255,0.06)"; };

/* ─── Helper: idéntico al original ────────────────────────── */
const formatAccountLabel = (account, owner) => {
  const number    = account?.accountNumber || account?._id || account?.id || "";
  const ownerName = owner ? `${owner.name || ""} ${owner.surname || ""}`.trim() : "Cuenta";
  return `${number} · ${ownerName}`;
};

/* ══════════════════════════════════════════════════════════════
   DepositTransactionModal — lógica 100% original
   ══════════════════════════════════════════════════════════════ */
export const DepositTransactionModal = ({ isOpen, onClose, onSubmit, loading, accounts = [], users = [], destinationAccount }) => {
  if (!isOpen) return null;
  // Estado: quitar sourceAccount — depósito administrativo desde admin
  const [form, setForm] = useState({ destinationAccount: destinationAccount || "", amount: "", description: "" });

  useEffect(() => {
    if (!isOpen) return;
    setForm({ destinationAccount: destinationAccount || "", amount: "", description: "" });
  }, [isOpen, destinationAccount]);

  const account = accounts.find(a => (a._id || a.id) === (destinationAccount || form.destinationAccount)) || null;
  const accountId = account ? (account._id || account.id) : null;
  const owner = account ? users.find(u => u.uid === account.externalUserId || u.id === account.externalUserId) : null;
  const ownerName = owner ? `${owner.name || ""} ${owner.surname || ""}`.trim() : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.destinationAccount) { onSubmit?.({ ok:false, error:"Debes indicar la cuenta destino" }); return; }
    if (!amount || amount <= 0)   { onSubmit?.({ ok:false, error:"Ingresa un monto válido" }); return; }
    if (amount > 2000)            { onSubmit?.({ ok:false, error:"El depósito no puede superar Q2000 por transacción" }); return; }
    onSubmit?.({ ok:true, payload: { type:"DEPOSIT", amount, sourceAccount: null, destinationAccount: form.destinationAccount, description: form.description || "Depósito administrativo" } });
  };

  const selectStyle = {
    ...inputStyle, cursor:"pointer", paddingRight:"32px",
    backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(232,240,254,0.4)' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", appearance:"none",
  };

  return (
    <>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ ...overlay, animation: "fadeIn 0.15s ease" }}>
        <div style={{ ...modalBox, animation: "fadeUp 0.22s cubic-bezier(0.22,1,0.36,1) both" }}>

          {/* Header */}
          <div style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, rgba(0,80,50,0.7) 0%, rgba(5,45,30,0.9) 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 90% 20%, rgba(0,212,160,0.2) 0%, transparent 60%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(0,212,160,0.2)", border: "1px solid rgba(0,212,160,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d4a0", flexShrink: 0 }}>
                <ArrowDownCircleIcon style={{ width: "18px", height: "18px" }} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#e8f0fe", margin: 0 }}>Registrar Depósito</h2>
                <p style={{ fontSize: "0.75rem", color: "rgba(232,240,254,0.4)", margin: 0 }}>Acredita efectivo externo a la cuenta</p>
              </div>
            </div>
            <button
              type="button" onClick={onClose} aria-label="Cerrar" disabled={loading}
              style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.14)", background: "transparent", color: "rgba(232,240,254,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", zIndex: 1 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <XMarkIcon style={{ width: "14px", height: "14px" }} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Row 1: cuenta destino (inmutable) */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:"14px" }}>
                <div>
                  <label style={labelStyle}>Cuenta destino</label>
                  {/* Mostrar la cuenta destino como campo de solo lectura (no editable) */}
                  <input style={{ ...inputStyle, background: "rgba(255,255,255,0.03)", cursor: "default" }} value={(() => {
                    // intentar resolver etiqueta legible desde accounts/users; si no, mostrar el id crudo
                    const acct = accounts.find(a => (a._id || a.id) === form.destinationAccount || a.accountNumber === form.destinationAccount);
                    const owner = acct ? users.find(u => u.uid === acct.externalUserId || u.id === acct.externalUserId) : null;
                    return acct ? formatAccountLabel(acct, owner) : String(form.destinationAccount || "");
                  })()}
                    readOnly
                    onFocus={e => e.target.blur()}
                  />
                </div>
              </div>

              {/* Monto */}
              <div>
                <label style={labelStyle}>Monto</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "rgba(232,240,254,0.4)", fontSize: "0.875rem" }}>Q</span>
                  <input
                    type="number" min="0.01" step="0.01" required
                    value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00"
                    style={{ ...inputStyle, paddingLeft: "28px" }}
                    onFocus={focusInput} onBlur={blurInput}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label style={labelStyle}>Descripción</label>
                <input
                  type="text" maxLength={300}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Depósito en efectivo"
                  style={inputStyle}
                  onFocus={focusInput} onBlur={blurInput}
                />
              </div>

              {/* Nota informativa */}
              <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(0,212,160,0.07)", border: "1px solid rgba(0,212,160,0.18)", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00d4a0", marginTop: "5px", flexShrink: 0 }} />
                <p style={{ fontSize: "0.75rem", color: "rgba(0,212,160,0.8)", lineHeight: 1.6, margin: 0 }}>
                  El monto se acredita directamente a la cuenta. No se debita ninguna otra cuenta del sistema.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "flex-end", gap: "10px", background: "rgba(12,20,40,0.95)" }}>
              <button
                type="button" onClick={onClose} disabled={loading}
                style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.14)", background: "transparent", color: "rgba(232,240,254,0.65)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                Cancelar
              </button>
              <button
                type="submit" disabled={loading}
                style={{ padding: "9px 22px", borderRadius: "10px", background: loading ? "rgba(0,212,160,0.4)" : "rgba(0,212,160,0.85)", border: "1px solid rgba(0,212,160,0.5)", color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(0,212,160,0.25)" }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "rgba(0,212,160,1)"; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = loading ? "rgba(0,212,160,0.4)" : "rgba(0,212,160,0.85)"; }}
              >
                {loading ? "Procesando…" : "Registrar depósito"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
