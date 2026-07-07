// DashboardContainer.jsx
import React from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export const DashboardContainer = ({ children }) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--dash-bg)' }}>
      <Navbar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global dark glassmorphism theme injected here so it cascades */}
      <style>{`
        :root {
          --dash-bg:          #070d1a;
          --dash-surface:     rgba(255,255,255,0.04);
          --dash-surface-md:  rgba(255,255,255,0.07);
          --dash-surface-hi:  rgba(255,255,255,0.11);
          --dash-border:      rgba(255,255,255,0.09);
          --dash-border-hi:   rgba(255,255,255,0.18);
          --dash-text:        #e8f0fe;
          --dash-text-muted:  rgba(232,240,254,0.45);
          --dash-accent:      #4f8ef7;
          --dash-accent-2:    #00d4a0;
          --dash-accent-3:    #a78bfa;
          --dash-danger:      #f87171;
          --dash-gold:        #fbbf24;
          --dash-blur:        blur(18px);
          --dash-blur-sm:     blur(10px);
          --dash-radius:      16px;
          --dash-radius-sm:   10px;
          --dash-shadow:      0 8px 32px rgba(0,0,0,0.45);
          --dash-shadow-lg:   0 20px 60px rgba(0,0,0,0.6);
          --dash-glow-blue:   0 0 40px rgba(79,142,247,0.18);
          --dash-glow-green:  0 0 40px rgba(0,212,160,0.12);
        }
      `}</style>
    </div>
  )
}