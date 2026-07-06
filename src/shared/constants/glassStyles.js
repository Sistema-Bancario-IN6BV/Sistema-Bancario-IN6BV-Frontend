// Tokens de estilo "glassmorphism" reutilizados en pantallas admin/cliente.
// Antes estaban redefinidos como objetos idénticos (o casi) en ~19 archivos de
// src/features/**/pages y src/features/**/components. Se centralizan aquí para
// que cada feature los importe en vez de copiarlos.

export const GLASS_PANEL = {
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
  overflow: 'hidden',
};

export const GLASS_STAT_CARD_COMPACT = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '14px',
  padding: '18px 20px',
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: '0 6px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
};

export const GLASS_MODAL_PANEL = {
  borderRadius: '18px',
  background: 'rgba(10,18,35,0.95)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  overflow: 'hidden',
};

export const GLASS_OVERLAY = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.65)',
  backdropFilter: 'blur(6px)',
  padding: '16px',
};

export const INPUT_STYLE = {
  padding: '9px 13px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px',
  color: '#e8f0fe',
  fontSize: '0.845rem',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};
