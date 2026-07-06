// AccountModal.jsx — REDISEÑO VISUAL ÚNICAMENTE
// Toda la lógica, estados, efectos, validaciones y onSubmit son idénticos al original
import { useEffect, useMemo, useState } from "react";

/* ─── Micro-icons inline (idénticos al original) ──────────── */
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);
const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconDollar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* ─── Shared dark styles ───────────────────────────────────── */
const overlay = {
  position:"fixed", inset:0,
  background:"rgba(4,8,20,0.75)",
  backdropFilter:"blur(6px)",
  WebkitBackdropFilter:"blur(6px)",
  display:"flex", alignItems:"center", justifyContent:"center",
  zIndex:50, padding:"16px",
  animation:"fadeIn 0.15s ease",
};

const modalBox = {
  background:          "rgba(12,20,40,0.95)",
  backdropFilter:      "blur(24px)",
  WebkitBackdropFilter:"blur(24px)",
  border:              "1px solid rgba(255,255,255,0.1)",
  borderRadius:        "18px",
  width:               "100%",
  maxWidth:            "480px",
  maxHeight:           "calc(100vh - 32px)",
  display:             "flex",
  flexDirection:       "column",
  overflow:            "hidden",
  boxShadow:           "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(79,142,247,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
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
  display:"flex", alignItems:"center", gap:"6px",
  fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em",
  textTransform:"uppercase", color:"rgba(232,240,254,0.4)",
  marginBottom:"6px",
};

const focusInput  = e => { e.target.style.borderColor="rgba(79,142,247,0.7)"; e.target.style.boxShadow="0 0 0 3px rgba(79,142,247,0.15)"; e.target.style.background="rgba(255,255,255,0.09)"; };
const blurInput   = e => { e.target.style.borderColor="rgba(255,255,255,0.12)"; e.target.style.boxShadow="none"; e.target.style.background="rgba(255,255,255,0.06)"; };

/* ─── Status badge color ───────────────────────────────────── */
const STATUS_STYLE = {
  ACTIVE:  { bg:"rgba(0,212,160,0.15)",  color:"#00d4a0", border:"rgba(0,212,160,0.3)"   },
  BLOCKED: { bg:"rgba(251,191,36,0.15)", color:"#fbbf24", border:"rgba(251,191,36,0.3)"  },
  CLOSED:  { bg:"rgba(248,113,113,0.15)",color:"#f87171", border:"rgba(248,113,113,0.3)" },
};

/* ══════════════════════════════════════════════════════════════
   AccountModal — lógica 100% original, solo rediseño visual
   ══════════════════════════════════════════════════════════════ */
export const AccountModal = ({ mode, isOpen, initialValues, onClose, onSubmit, loading, users = [] }) => {
  // ── Estado: idéntico al original ──────────────────────────
  const [form, setForm] = useState({ externalUserId:"", balance:"", accountNumber:"", status:"ACTIVE" });
  const [searchUser, setSearchUser]       = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!searchUser) return users;
    const lowerSearch = searchUser.toLowerCase();
    return users.filter(u => {
      const fullName = `${u.name || ''} ${u.surname || ''}`.toLowerCase();
      const dpi      = String(u.dpi || '').toLowerCase();
      return fullName.includes(lowerSearch) || dpi.includes(lowerSearch);
    });
  }, [users, searchUser]);

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      externalUserId: initialValues?.externalUserId ?? "",
      balance:        initialValues?.balance !== undefined && initialValues?.balance !== null ? String(initialValues.balance) : "",
      accountNumber:  initialValues?.accountNumber ?? "",
      status:         initialValues?.status ?? "ACTIVE",
    });
  }, [isOpen, initialValues]);

  const title = useMemo(() => {
    if (mode === "create") return "Agregar Cuenta";
    if (mode === "edit")   return "Editar Cuenta";
    return "Cuenta";
  }, [mode]);

  if (!isOpen) return null;

  // ── Submit: idéntico al original ──────────────────────────
  const submit = (e) => {
    e.preventDefault();
    const balanceNum = form.balance === "" ? 0 : Number(form.balance);
    if (Number.isNaN(balanceNum) || balanceNum < 0) { onSubmit?.({ ok:false, error:"Balance inválido" }); return; }
    if (mode === "create" && !form.externalUserId)  { onSubmit?.({ ok:false, error:"externalUserId requerido" }); return; }
    if (mode === "create" && users.length > 0) {
      const userExists = users.some(u => u.uid === form.externalUserId || u.id === form.externalUserId);
      if (!userExists) { onSubmit?.({ ok:false, error:"El ID de usuario ingresado no existe en la base de datos." }); return; }
    }
    const payload = {
      externalUserId: form.externalUserId || undefined,
      balance:        balanceNum,
      accountNumber:  form.accountNumber ? form.accountNumber : undefined,
      status:         mode === "edit" ? form.status : undefined,
    };
    onSubmit?.({ ok:true, payload });
  };

  const sc = STATUS_STYLE[form.status] || STATUS_STYLE.CLOSED;

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={overlay}>
        <div style={modalBox}>

          {/* Header */}
          <div style={{
            padding:"20px 24px",
            background:"linear-gradient(135deg, rgba(10,37,64,0.95) 0%, rgba(26,75,140,0.7) 100%)",
            borderBottom:"1px solid rgba(255,255,255,0.07)",
            display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px",
            flexShrink:0,
            position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 80% at 90% 20%, rgba(79,142,247,0.18) 0%, transparent 60%)", pointerEvents:"none" }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px" }}>
                <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:"rgba(79,142,247,0.2)", border:"1px solid rgba(79,142,247,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <IconUser />
                </div>
                <h2 style={{ fontFamily:'"DM Serif Display", Georgia, serif', fontSize:"1.2rem", fontWeight:400, color:"#e8f0fe", margin:0 }}>
                  {title}
                </h2>
              </div>
              <p style={{ fontSize:"0.78rem", color:"rgba(232,240,254,0.4)", margin:0 }}>
                {mode === "create" ? "Crea una cuenta para un cliente" : "Actualiza los datos permitidos"}
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
            <div style={{ padding:"20px 24px 80px", overflowY:"auto", flex:1 }}>

              {/* externalUserId */}
              {mode === "create" ? (
                <div style={{ marginBottom:"16px", position:"relative" }}>
                  <label style={labelStyle}><IconUser /> Buscar Usuario (Nombre, Apellido o DPI)</label>
                  <input
                    style={inputStyle}
                    value={searchUser}
                    onChange={e => {
                      setSearchUser(e.target.value);
                      const exactMatch = users.find(u => u.uid === e.target.value || u.id === e.target.value || u.dpi === e.target.value);
                      setForm(f => ({ ...f, externalUserId: exactMatch ? (exactMatch.uid || exactMatch.id) : "" }));
                    }}
                    onFocus={e => { setIsDropdownOpen(true); focusInput(e); }}
                    onBlur={blurInput}
                    placeholder="Escribe para buscar…"
                    autoComplete="off"
                  />
                  {isDropdownOpen && (
                    <div style={{
                      position:"absolute", top:"100%", left:0, right:0, zIndex:20,
                      background:"rgba(12,20,40,0.98)", backdropFilter:"blur(18px)",
                      border:"1px solid rgba(255,255,255,0.12)", borderRadius:"10px",
                      marginTop:"4px", maxHeight:"200px", overflowY:"auto",
                      boxShadow:"0 16px 48px rgba(0,0,0,0.6)",
                    }}>
                      {filteredUsers.length > 0 ? filteredUsers.map(u => (
                        <div
                          key={u.uid || u.id}
                          onClick={() => {
                            const idToUse = u.uid || u.id;
                            setSearchUser(`${u.name || ''} ${u.surname || ''} - DPI: ${u.dpi || 'N/A'}`);
                            setForm(f => ({ ...f, externalUserId: idToUse }));
                            setIsDropdownOpen(false);
                          }}
                          style={{ padding:"10px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)", cursor:"pointer", transition:"background 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(79,142,247,0.1)"}
                          onMouseLeave={e => e.currentTarget.style.background="transparent"}
                        >
                          <p style={{ fontSize:"0.845rem", fontWeight:600, color:"#e8f0fe", margin:0 }}>{u.name} {u.surname}</p>
                          <p style={{ fontSize:"0.72rem", color:"rgba(232,240,254,0.4)", margin:"2px 0 0" }}>DPI: {u.dpi || 'N/A'}</p>
                        </div>
                      )) : (
                        <div style={{ padding:"12px 14px", fontSize:"0.845rem", color:"rgba(232,240,254,0.38)" }}>No se encontraron usuarios…</div>
                      )}
                    </div>
                  )}
                  {isDropdownOpen && <div style={{ position:"fixed", inset:0, zIndex:19 }} onClick={() => setIsDropdownOpen(false)} />}
                </div>
              ) : (
                <div style={{ marginBottom:"16px" }}>
                  <label style={labelStyle}><IconUser /> Usuario (solo lectura)</label>
                  <input style={{ ...inputStyle, opacity:0.5, cursor:"not-allowed" }} value={form.externalUserId} readOnly disabled />
                </div>
              )}

              {/* Saldo */}
              <div style={{ marginBottom:"16px" }}>
                <label style={labelStyle}><IconDollar /> Saldo</label>
                <input
                  style={inputStyle}
                  value={form.balance}
                  onChange={e => setForm(f => ({ ...f, balance: e.target.value }))}
                  placeholder="0.00"
                  inputMode="decimal"
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </div>

              {/* Estado (solo edit) */}
              {mode === "edit" && (
                <div style={{ marginBottom:"16px" }}>
                  <label style={labelStyle}><IconShield /> Estado</label>
                  <select
                    style={{
                      ...inputStyle, cursor:"pointer", paddingRight:"32px",
                      backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(232,240,254,0.4)' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                      backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", appearance:"none",
                    }}
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    onFocus={focusInput}
                    onBlur={blurInput}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="BLOCKED">BLOCKED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                  {/* Badge preview */}
                  <div style={{ marginTop:"8px" }}>
                    <span style={{
                      display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:"999px",
                      fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                      background: sc.bg, color: sc.color, border:`1px solid ${sc.border}`,
                    }}>{form.status}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding:"14px 24px", borderTop:"1px solid rgba(255,255,255,0.07)",
              display:"flex", justifyContent:"flex-end", gap:"10px",
              flexShrink:0, background:"rgba(12,20,40,0.95)",
            }}>
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
                style={{
                  padding:"9px 22px", borderRadius:"10px",
                  background: loading ? "rgba(79,142,247,0.4)" : "rgba(79,142,247,0.85)",
                  border:"1px solid rgba(79,142,247,0.5)",
                  color:"#fff", fontSize:"0.875rem", fontWeight:700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow:"0 4px 16px rgba(79,142,247,0.3)",
                  display:"inline-flex", alignItems:"center", gap:"7px",
                  transition:"all 0.18s",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background="rgba(79,142,247,1)"; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background="rgba(79,142,247,0.85)"; }}
              >
                {loading
                  ? <><SpinnerSmall /> Procesando…</>
                  : mode === "create" ? "Crear cuenta" : "Guardar cambios"
                }
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