// Sidebar.jsx — REDISEÑO VISUAL ÚNICAMENTE
// Toda la lógica, rutas, roles, getFavorites, useEffect, Link, etc. son idénticos al original
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";
import {
  ChartBarIcon,
  UsersIcon,
  ShoppingBagIcon,
  TableCellsIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from 'react';
import { getFavorites } from '../../api/admin';
import { normalizeRole } from "../../utils/authRole";

/* ── Menús por rol — idénticos al original ── */
const adminMenuItems = [
  { label: "Dashboard",      to: "/admin",               icon: HomeIcon },
  { label: "Cuentas",        to: "/admin/accounts",      icon: ChartBarIcon },
  { label: "Transacciones",  to: "/admin/transactions",  icon: TableCellsIcon },
  { label: "Usuarios",       to: "/admin/users",         icon: UsersIcon },
  { label: "Productos",      to: "/admin/products",      icon: ShoppingBagIcon },
  { label: "Servicios",      to: "/admin/services",      icon: ShoppingBagIcon },
];

const customerMenuItems = [
  { label: "Dashboard",      to: "/client",              icon: HomeIcon },
  { label: "Cuentas",        to: "/client/accounts",     icon: ChartBarIcon },
  { label: "Transacciones",  to: "/client/transactions", icon: TableCellsIcon },
  { label: "Productos",      to: "/client/products",     icon: ShoppingBagIcon },
  { label: "Servicios",      to: "/client/services",     icon: ShoppingBagIcon },
];

const menuItemsByRole = {
  ADMIN_ROLE:       adminMenuItems,
  PLATFORM_ADMIN:   adminMenuItems,
  RESTAURANT_ADMIN: adminMenuItems,
  USER_ROLE:        customerMenuItems,
  CUSTOMER:         customerMenuItems,
};

export const Sidebar = () => {
  const location  = useLocation();
  const user      = useAuthStore((state) => state.user);
  const role      = normalizeRole(user?.role) || "USER_ROLE";
  const menuItems = menuItemsByRole[role] || menuItemsByRole.USER_ROLE;
  const [favorites, setFavorites] = useState([]);
  const [expanded, setExpanded]   = useState(false);

  /* ── lógica original intacta ── */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getFavorites();
        if (!mounted) return;
        setFavorites(res?.data || []);
      } catch (err) {
        console.warn('getFavorites failed:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          position:        'sticky',
          top:             '68px',
          height:          'calc(100vh - 68px)',
          width:           expanded ? '220px' : '64px',
          transition:      'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflow:        'hidden',
          flexShrink:      0,
          display:         'flex',
          flexDirection:   'column',
          padding:         '16px 10px',
          zIndex:          40,
          /* glassmorphism */
          background:      'rgba(10,18,35,0.85)',
          backdropFilter:  'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight:     '1px solid rgba(255,255,255,0.07)',
          boxShadow:       '4px 0 30px rgba(0,0,0,0.4)',
        }}
      >
        {/* Subtle vertical accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: '2px',
          background: 'linear-gradient(180deg, transparent, rgba(79,142,247,0.5) 40%, rgba(0,212,160,0.3) 70%, transparent)',
        }} />

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>

          {/* Favorites section — lógica original */}
          {favorites && favorites.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'rgba(232,240,254,0.3)',
                padding: '0 8px', marginBottom: '6px',
                opacity: expanded ? 1 : 0, transition: 'opacity 0.2s ease',
                whiteSpace: 'nowrap',
              }}>
                Favoritos
              </div>
              {favorites.map((f) => (
                <Link
                  key={f._id || f.id || f.accountId}
                  to={`/client/accounts?fav=${f.accountId}`}
                  style={sidebarItemStyle(false)}
                  onMouseEnter={e => applyHover(e, true)}
                  onMouseLeave={e => applyHover(e, false)}
                >
                  <StarIcon style={{ width: '18px', height: '18px', flexShrink: 0, color: '#fbbf24' }} />
                  <span style={labelStyle(expanded)}>{f.alias || f.accountNumber || f.accountId}</span>
                </Link>
              ))}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '10px 6px' }} />
            </div>
          )}

          {/* Main menu items */}
          {menuItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                style={sidebarItemStyle(active)}
                onMouseEnter={e => !active && applyHover(e, true)}
                onMouseLeave={e => !active && applyHover(e, false)}
              >
                {/* Active indicator bar */}
                {active && (
                  <span style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: '3px', borderRadius: '0 3px 3px 0',
                    background: 'linear-gradient(180deg, #4f8ef7, #00d4a0)',
                    boxShadow: '0 0 10px rgba(79,142,247,0.6)',
                  }} />
                )}

                <item.icon style={{
                  width: '20px', height: '20px', flexShrink: 0,
                  color: active ? '#4f8ef7' : 'rgba(232,240,254,0.45)',
                  transition: 'color 0.2s',
                  filter: active ? 'drop-shadow(0 0 6px rgba(79,142,247,0.7))' : 'none',
                }} />
                <span style={labelStyle(expanded)}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: version chip */}
        <div style={{
          opacity: expanded ? 1 : 0, transition: 'opacity 0.25s ease',
          paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(232,240,254,0.2)', textAlign: 'center', whiteSpace: 'nowrap',
          }}>
            IN6BV · Sistema Bancario
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar-link-hover {
          background: rgba(79,142,247,0.08) !important;
          color: rgba(232,240,254,0.9) !important;
        }
      `}</style>
    </>
  );
};

/* ── Style helpers (evitan inline repetición) ── */
const sidebarItemStyle = (active) => ({
  position:       'relative',
  display:        'flex',
  alignItems:     'center',
  gap:            '12px',
  padding:        '10px 10px',
  borderRadius:   '10px',
  textDecoration: 'none',
  whiteSpace:     'nowrap',
  overflow:       'hidden',
  transition:     'background 0.18s ease, box-shadow 0.18s ease',
  background:     active
    ? 'linear-gradient(135deg, rgba(79,142,247,0.22), rgba(0,212,160,0.10))'
    : 'transparent',
  border:         active
    ? '1px solid rgba(79,142,247,0.25)'
    : '1px solid transparent',
  boxShadow:      active ? '0 4px 20px rgba(79,142,247,0.15)' : 'none',
});

const labelStyle = (expanded) => ({
  fontSize:   '0.845rem',
  fontWeight: 500,
  color:      'rgba(232,240,254,0.8)',
  opacity:    expanded ? 1 : 0,
  transition: 'opacity 0.2s ease',
  letterSpacing: '0.01em',
});

const applyHover = (e, on) => {
  const el = e.currentTarget;
  el.style.background = on ? 'rgba(79,142,247,0.08)' : 'transparent';
};