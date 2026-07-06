import React from 'react';
import { GLASS_PANEL as glass } from '../../../shared/constants/glassStyles';

const STAT_CONFIGS = {
  'Cuentas registradas': { grad: 'linear-gradient(135deg,#4f8ef7,#2563eb)', glow: 'rgba(79,142,247,0.35)'  },
  'Saldo consolidado':   { grad: 'linear-gradient(135deg,#00d4a0,#059669)', glow: 'rgba(0,212,160,0.35)'   },
  'Cuentas activas':     { grad: 'linear-gradient(135deg,#a78bfa,#7c3aed)', glow: 'rgba(167,139,250,0.35)' },
  'Bloqueadas':          { grad: 'linear-gradient(135deg,#f87171,#dc2626)', glow: 'rgba(248,113,113,0.35)' },
};

export const StatCard = ({ label, value, icon: Icon }) => {
  const cfg = STAT_CONFIGS[label] || STAT_CONFIGS['Bloqueadas'];
  return (
    <article
      style={{ ...glass, position: 'relative', padding: '22px 24px', transition: 'transform 0.22s ease, box-shadow 0.22s ease', cursor: 'default' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.5), ${cfg.glow} 0 0 30px, inset 0 1px 0 rgba(255,255,255,0.08)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: cfg.grad, borderRadius: '16px 16px 0 0' }} />
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: cfg.grad, opacity: 0.08, filter: 'blur(20px)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(232,240,254,0.45)', marginBottom: '8px' }}>{label}</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e8f0fe', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</p>
        </div>
        <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: cfg.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 6px 20px ${cfg.glow}` }}>
          <Icon style={{ width: '22px', height: '22px', color: '#fff' }} />
        </div>
      </div>
    </article>
  );
};
