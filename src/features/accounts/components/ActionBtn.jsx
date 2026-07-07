import React from 'react';

export const ActionBtn = ({ icon, label, color, border, textColor, hoverBg, onClick, disabled, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '7px 14px', borderRadius: '9px',
      background: color, border: `1px solid ${border}`, color: textColor,
      fontSize: '0.78rem', fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1, transition: 'all 0.18s ease',
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = hoverBg; }}
    onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = color; }}
  >
    {icon}
    {label}
  </button>
);
