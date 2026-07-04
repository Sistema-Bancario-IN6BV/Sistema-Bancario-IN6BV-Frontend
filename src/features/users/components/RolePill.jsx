import React from 'react';

const ROLE_STYLES = {
  ADMIN_ROLE: { background: 'rgba(79,142,247,0.15)', border: '1px solid rgba(79,142,247,0.35)', color: '#a5c8ff' },
  USER_ROLE:  { background: 'rgba(0,212,160,0.12)',  border: '1px solid rgba(0,212,160,0.3)',   color: '#00d4a0' },
};

const DEFAULT_STYLE = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(232,240,254,0.5)' };

export const RolePill = ({ role }) => {
  const s = ROLE_STYLES[role] || DEFAULT_STYLE;
  return (
    <span style={{
      ...s,
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '0.68rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      whiteSpace: 'nowrap',
    }}>
      {role}
    </span>
  );
};
