import React from 'react';

export const QuickActionCard = ({ icon: Icon, label, color, glow = 'rgba(79,142,247,0.3)', onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '12px', padding: '20px 12px', borderRadius: '14px',
      background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.08)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1, transition: 'all 0.2s ease', width: '100%',
    }}
    onMouseEnter={e => {
      if (!disabled) {
        e.currentTarget.style.transform   = 'translateY(-3px)';
        e.currentTarget.style.background  = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
        e.currentTarget.style.boxShadow   = '0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)';
      }
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform   = 'translateY(0)';
      e.currentTarget.style.background  = 'rgba(255,255,255,0.04)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      e.currentTarget.style.boxShadow   = 'none';
    }}
  >
    <div style={{
      width: '46px', height: '46px', borderRadius: '12px', background: color, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 6px 20px ${glow}`, transition: 'transform 0.2s',
    }}>
      <Icon style={{ width: '22px', height: '22px', color: '#fff' }} />
    </div>
    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(232,240,254,0.7)', textAlign: 'center', lineHeight: 1.3 }}>
      {label}
    </span>
  </button>
);
