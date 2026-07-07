import React from 'react';

export const UserAvatar = ({ name, surname }) => {
  const letters = [name?.[0], surname?.[0]].filter(Boolean).join('').toUpperCase() || '?';
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(79,142,247,0.25), rgba(0,212,160,0.15))',
      border: '1px solid rgba(79,142,247,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.72rem', fontWeight: 700, color: '#a5c8ff',
      flexShrink: 0, boxShadow: '0 2px 8px rgba(79,142,247,0.2)',
    }}>
      {letters}
    </div>
  );
};
