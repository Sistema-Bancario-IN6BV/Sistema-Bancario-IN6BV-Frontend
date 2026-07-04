import React from 'react';

export const StatCard = ({ label, value, icon: Icon, grad, glow }) => (
  <article style={{
    position: 'relative', overflow: 'hidden',
    borderRadius: '14px', padding: '18px 20px',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.09)',
    boxShadow: '0 6px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: grad }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
      <div>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(232,240,254,0.4)', marginBottom: '6px' }}>{label}</p>
        <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#e8f0fe', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</p>
      </div>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 16px ${glow}` }}>
        <Icon style={{ width: '18px', height: '18px', color: '#fff' }} />
      </div>
    </div>
  </article>
);
