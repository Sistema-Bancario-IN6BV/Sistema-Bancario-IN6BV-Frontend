// AccountConfirmDeleteModal.jsx — REDISEÑO VISUAL ÚNICAMENTE
// Lógica: useUIStore original intacto
import { useUIStore } from "../../../shared/components/ui/store/uiStore";

const IconAlertTriangle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
);

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

export const AccountConfirmDeleteModal = () => {
  /* — useUIStore original intacto — */
  const { confirmModal, closeConfirm } = useUIStore();

  const title   = confirmModal.title   || "Confirmar";
  const message = confirmModal.message || "¿Estás seguro?";

  if (!confirmModal.isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from{opacity:0}            to{opacity:1}              }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseWarn { 0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,0.4)} 50%{box-shadow:0 0 0 8px rgba(248,113,113,0)} }
      `}</style>
      <div style={{
        position:"fixed", inset:0,
        background:"rgba(4,8,20,0.78)",
        backdropFilter:"blur(8px)",
        WebkitBackdropFilter:"blur(8px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        zIndex:60, padding:"16px",
        animation:"fadeIn 0.15s ease",
      }}>
        <div style={{
          background:          "rgba(12,20,40,0.97)",
          backdropFilter:      "blur(24px)",
          WebkitBackdropFilter:"blur(24px)",
          border:              "1px solid rgba(255,255,255,0.1)",
          borderRadius:        "18px",
          width:               "100%",
          maxWidth:            "380px",
          overflow:            "hidden",
          boxShadow:           "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(248,113,113,0.1), inset 0 1px 0 rgba(255,255,255,0.06)",
          animation:           "fadeUp 0.22s cubic-bezier(0.22,1,0.36,1) both",
        }}>

          {/* Header */}
          <div style={{
            padding:"18px 20px",
            background:"linear-gradient(135deg, rgba(80,10,10,0.7) 0%, rgba(45,5,5,0.9) 100%)",
            borderBottom:"1px solid rgba(255,255,255,0.07)",
            display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px",
            position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 80% at 90% 20%, rgba(248,113,113,0.2) 0%, transparent 60%)", pointerEvents:"none" }} />
            <div style={{ display:"flex", alignItems:"center", gap:"8px", position:"relative", zIndex:1 }}>
              <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:"rgba(248,113,113,0.2)", border:"1px solid rgba(248,113,113,0.35)", display:"flex", alignItems:"center", justifyContent:"center", color:"#f87171" }}>
                <IconAlertTriangle />
              </div>
              <h2 style={{ fontFamily:'"DM Serif Display", Georgia, serif', fontSize:"1.1rem", fontWeight:400, color:"#e8f0fe", margin:0 }}>
                {title}
              </h2>
            </div>
            <button
              type="button" onClick={closeConfirm} aria-label="Cerrar"
              style={{ width:"28px", height:"28px", borderRadius:"7px", border:"1px solid rgba(255,255,255,0.14)", background:"transparent", color:"rgba(232,240,254,0.5)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s", position:"relative", zIndex:1 }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#e8f0fe"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(232,240,254,0.5)"; }}
            >
              <IconX />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding:"28px 24px", textAlign:"center" }}>
            {/* Warning icon */}
            <div style={{
              width:"56px", height:"56px", borderRadius:"50%",
              background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)",
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 16px", color:"#f87171",
              animation:"pulseWarn 2s ease-in-out infinite",
            }}>
              <IconAlertTriangle />
            </div>
            <p style={{ fontSize:"0.9rem", color:"rgba(232,240,254,0.6)", lineHeight:1.7, margin:0 }}>
              {message}
            </p>
          </div>

          {/* Footer */}
          <div style={{ padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", justifyContent:"flex-end", gap:"10px", background:"rgba(12,20,40,0.95)" }}>
            <button
              type="button" onClick={closeConfirm}
              style={{ padding:"9px 18px", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.14)", background:"transparent", color:"rgba(232,240,254,0.65)", fontSize:"0.875rem", fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color="#e8f0fe"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(232,240,254,0.65)"; }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => { confirmModal.onConfirm?.(); closeConfirm(); }}
              style={{ padding:"9px 20px", borderRadius:"10px", background:"rgba(248,113,113,0.85)", border:"1px solid rgba(248,113,113,0.5)", color:"#fff", fontSize:"0.875rem", fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(248,113,113,0.25)", display:"inline-flex", alignItems:"center", gap:"6px", transition:"all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(248,113,113,1)"; e.currentTarget.style.boxShadow="0 6px 24px rgba(248,113,113,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(248,113,113,0.85)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(248,113,113,0.25)"; }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};