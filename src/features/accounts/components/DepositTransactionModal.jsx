// DepositTransactionModal.jsx — REDISEÑO VISUAL ÚNICAMENTE
// Toda la lógica, validaciones y onSubmit son idénticos al original
import { useEffect, useMemo, useState } from "react";

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

const IconArrowDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14m7-7-7 7-7-7"/>
  </svg>
);

/* ─── Shared styles ────────────────────────────────────────── */
const overlay = {
  position:"fixed", inset:0,
  background:"rgba(4,8,20,0.75)",
  backdropFilter:"blur(6px)",
  WebkitBackdropFilter:"blur(6px)",
  display:"flex", alignItems:"center", justifyContent:"center",
  zIndex:50, padding:"16px",
  animation:"fadeIn 0.15s ease",
  overflowY:"auto",
};

const modalBox = {
  background:          "rgba(12,20,40,0.95)",
  backdropFilter:      "blur(24px)",
  WebkitBackdropFilter:"blur(24px)",
  border:              "1px solid rgba(255,255,255,0.1)",
  borderRadius:        "18px",
  width:               "100%",
  maxWidth:            "620px",
  maxHeight:           "calc(100vh - 32px)",
  margin:              "16px 0",
  display:             "flex",
  flexDirection:       "column",
  overflow:            "hidden",
  boxShadow:           "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,212,160,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
  animation:           "fadeUp 0.22s cubic-bezier(0.22,1,0.36,1) both",
};

const inputStyle = {
  width:"100%", padding:"10px 13px",
  background:"rgba(255,255,255,0.06)",
  border:"1.5px solid rgba(255,255,255,0.12)",
  borderRadius:"10px",
  color:"#e8f0fe",
  fontSize:"0.875rem",
  fontFamily:"inherit",
  outline:"none",
  transition:"border-color 0.2s, box-shadow 0.2s, background 0.2s",
};

const labelStyle = {
  fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em",
  textTransform:"uppercase", color:"rgba(232,240,254,0.4)",
  marginBottom:"6px", display:"block",
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
  // ── Estado: idéntico al original ──────────────────────────
  const [form, setForm] = useState({ sourceAccount:"", destinationAccount: destinationAccount || "", amount:"", description:"" });

  useEffect(() => {
    if (!isOpen) return;
    setForm({ sourceAccount:"", destinationAccount: destinationAccount || "", amount:"", description:"" });
  }, [isOpen, destinationAccount]);

  const activeAccounts = useMemo(() => accounts.filter(a => a.status === "ACTIVE"), [accounts]);

  // Hooks must always run in the same order every render (Rules of Hooks) —
  // this early return has to come after all of them, not before.
  if (!isOpen) return null;

  // ── Submit: idéntico al original ──────────────────────────
  const submit = (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.sourceAccount)      { onSubmit?.({ ok:false, error:"Debes seleccionar la cuenta origen" }); return; }
    if (!form.destinationAccount) { onSubmit?.({ ok:false, error:"Debes indicar la cuenta destino" }); return; }
    if (!amount || amount <= 0)   { onSubmit?.({ ok:false, error:"Ingresa un monto válido" }); return; }
    if (amount > 2000)            { onSubmit?.({ ok:false, error:"El depósito no puede superar Q2000 por transacción" }); return; }
    if (String(form.sourceAccount) === String(form.destinationAccount)) { onSubmit?.({ ok:false, error:"La cuenta origen y destino no pueden ser la misma" }); return; }
    onSubmit?.({ ok:true, payload: { type:"DEPOSIT", amount, sourceAccount:form.sourceAccount, destinationAccount:form.destinationAccount, description: form.description || "Depósito administrativo" } });
  };

  const selectStyle = {
    ...inputStyle, cursor:"pointer", paddingRight:"32px",
    backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(232,240,254,0.4)' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", appearance:"none",
  };

  return (
    <>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={overlay}>
        <div style={modalBox}>

          {/* Header */}
          <div style={{
            padding:"20px 24px",
            background:"linear-gradient(135deg, rgba(0,80,50,0.7) 0%, rgba(5,45,30,0.9) 100%)",
            borderBottom:"1px solid rgba(255,255,255,0.07)",
            display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px",
            flexShrink:0, position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 80% at 90% 20%, rgba(0,212,160,0.22) 0%, transparent 60%)", pointerEvents:"none" }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px" }}>
                <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:"rgba(0,212,160,0.2)", border:"1px solid rgba(0,212,160,0.35)", display:"flex", alignItems:"center", justifyContent:"center", color:"#00d4a0" }}>
                  <IconArrowDown />
                </div>
                <h2 style={{ fontFamily:'"DM Serif Display", Georgia, serif', fontSize:"1.2rem", fontWeight:400, color:"#e8f0fe", margin:0 }}>
                  Registrar Depósito
                </h2>
              </div>
              <p style={{ fontSize:"0.78rem", color:"rgba(232,240,254,0.4)", margin:0 }}>
                Abona fondos a la cuenta seleccionada
              </p>
            </div>
            <button
              type="button" onClick={onClose} aria-label="Cerrar"
              style={{ width:"30px", height:"30px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.14)", background:"transparent", color:"rgba(232,240,254,0.5)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s", position:"relative", zIndex:1 }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#e8f0fe"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(232,240,254,0.5)"; }}
            >
              <IconX />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", flex:1, minHeight:0 }}>
            <div style={{ padding:"20px 24px 80px", overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:"16px" }}>

              {/* Row 1: source + destination */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                <div>
                  <label style={labelStyle}>Cuenta origen</label>
                  <select style={selectStyle} value={form.sourceAccount}
                    onChange={e => setForm(p => ({ ...p, sourceAccount: e.target.value }))}
                    onFocus={focusInput} onBlur={blurInput}>
                    <option value="">Selecciona una cuenta</option>
                    {activeAccounts.map(account => {
                      const owner = users.find(u => u.uid === account.externalUserId || u.id === account.externalUserId);
                      return (
                        <option key={account._id || account.id} value={account._id || account.id}>
                          {formatAccountLabel(account, owner)}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Cuenta destino</label>
                  <input style={inputStyle} value={form.destinationAccount}
                    onChange={e => setForm(p => ({ ...p, destinationAccount: e.target.value }))}
                    placeholder="Id o número de cuenta"
                    onFocus={focusInput} onBlur={blurInput}
                  />
                  <p style={{ fontSize:"0.7rem", color:"rgba(232,240,254,0.3)", marginTop:"4px" }}>
                    Puedes pegar el ID o el número de cuenta destino.
                  </p>
                </div>
              </div>

              {/* Row 2: amount + description */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                <div>
                  <label style={labelStyle}>Monto</label>
                  <input style={inputStyle} type="number" min="1" max="2000" step="0.01"
                    value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="500.00"
                    onFocus={focusInput} onBlur={blurInput}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Descripción</label>
                  <input style={inputStyle} value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Depósito de caja"
                    onFocus={focusInput} onBlur={blurInput}
                  />
                </div>
              </div>

              {/* Info note */}
              <div style={{ padding:"10px 14px", borderRadius:"10px", background:"rgba(0,212,160,0.08)", border:"1px solid rgba(0,212,160,0.2)", display:"flex", gap:"8px", alignItems:"flex-start" }}>
                <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#00d4a0", marginTop:"5px", flexShrink:0 }} />
                <p style={{ fontSize:"0.75rem", color:"rgba(0,212,160,0.8)", lineHeight:1.6, margin:0 }}>
                  El monto máximo por depósito es de <strong>Q2,000</strong>. La cuenta origen y destino deben ser diferentes.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding:"14px 24px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", justifyContent:"flex-end", gap:"10px", flexShrink:0, background:"rgba(12,20,40,0.95)" }}>
              <button
                type="button" onClick={onClose} disabled={loading}
                style={{ padding:"9px 18px", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.14)", background:"transparent", color:"rgba(232,240,254,0.65)", fontSize:"0.875rem", fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color="#e8f0fe"; }}
                onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(232,240,254,0.65)"; }}
              >
                Cancelar
              </button>
              <button
                type="submit" disabled={loading}
                style={{ padding:"9px 22px", borderRadius:"10px", background: loading ? "rgba(0,212,160,0.4)" : "rgba(0,212,160,0.85)", border:"1px solid rgba(0,212,160,0.5)", color:"#fff", fontSize:"0.875rem", fontWeight:700, cursor: loading ? "not-allowed" : "pointer", boxShadow:"0 4px 16px rgba(0,212,160,0.25)", display:"inline-flex", alignItems:"center", gap:"7px", transition:"all 0.18s" }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background="rgba(0,212,160,1)"; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background="rgba(0,212,160,0.85)"; }}
              >
                {loading ? <><SpinnerSmall /> Procesando…</> : "Registrar depósito"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const SpinnerSmall = () => (
  <span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
);