// MainContainer.jsx — REDISEÑO VISUAL · Lógica intacta
import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const MainContainer = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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