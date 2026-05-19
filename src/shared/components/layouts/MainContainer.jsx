// MainContainer.jsx — REDISEÑO VISUAL ÚNICAMENTE
// Estructura y lógica original intacta
import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const MainContainer = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--dash-bg, #070d1a)' }}>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};