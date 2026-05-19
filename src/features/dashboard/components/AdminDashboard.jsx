// AdminDashboard.jsx — REDISEÑO VISUAL ÚNICAMENTE
// Toda la lógica, estados, efectos, API calls, handlers son idénticos al original
import React, { useEffect, useMemo, useState } from 'react';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { useUserManagmentStore } from '../../users/store/useUserManagmentStore';
import {
  getTransactions,
  getAccountRequests,
  approveAccountRequest,
  rejectAccountRequest,
} from '../../../shared/api/admin';
import { showError, showSuccess } from '../../../shared/utils/toast';
import { Spinner } from '../../../shared/components/layouts/Spinner.jsx';
import {
  ArrowPathIcon,
  UsersIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const dayLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

/* ── Helpers — idénticos al original ── */
const formatMoney = (value) =>
  `Q ${Number(value || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const aggregateByDay = (transactions = []) => {
  const totals = new Map(dayLabels.map((label) => [label, 0]));
  transactions.forEach((tx) => {
    const date = tx?.createdAt || tx?.date || tx?.created_at;
    if (!date) return;
    const dayIndex = new Date(date).getDay();
    const normalizedDay = dayIndex === 0 ? 6 : dayIndex - 1;
    const label = dayLabels[normalizedDay];
    totals.set(label, (totals.get(label) || 0) + Math.abs(Number(tx?.amount || 0)));
  });
  return dayLabels.map((label) => ({ label, value: totals.get(label) || 0 }));
};

/* ── StatCard — rediseño glassmorphism, props idénticos ── */
const STAT_CONFIGS = {
  'Usuarios':         { grad: 'linear-gradient(135deg,#4f8ef7,#2563eb)', glow: 'rgba(79,142,247,0.3)'  },
  'Cuentas':          { grad: 'linear-gradient(135deg,#00d4a0,#059669)', glow: 'rgba(0,212,160,0.3)'   },
  'Transacciones':    { grad: 'linear-gradient(135deg,#a78bfa,#7c3aed)', glow: 'rgba(167,139,250,0.3)' },
  'Saldo Total':      { grad: 'linear-gradient(135deg,#fbbf24,#d97706)', glow: 'rgba(251,191,36,0.3)'  },
  'Cuentas Activas':  { grad: 'linear-gradient(135deg,#f87171,#dc2626)', glow: 'rgba(248,113,113,0.3)' },
  'Hoy':              { grad: 'linear-gradient(135deg,#94a3b8,#475569)', glow: 'rgba(148,163,184,0.2)' },
};

const StatCard = ({ label, value, icon: Icon }) => {
  const cfg = STAT_CONFIGS[label] || STAT_CONFIGS['Hoy'];
  return (
    <article
      style={{
        position:       'relative',
        overflow:       'hidden',
        borderRadius:   '16px',
        padding:        '22px 24px',
        background:     'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border:         '1px solid rgba(255,255,255,0.09)',
        boxShadow:      `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)`,
        transition:     'transform 0.22s ease, box-shadow 0.22s ease',
        cursor:         'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.45), ${cfg.glow} 0 0 30px, inset 0 1px 0 rgba(255,255,255,0.08)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)`;
      }}
    >
      {/* Top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: cfg.grad, borderRadius: '16px 16px 0 0',
      }} />

      {/* Background glow blob */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '80px', height: '80px', borderRadius: '50%',
        background: cfg.grad, opacity: 0.08, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <p style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'rgba(232,240,254,0.45)', marginBottom: '8px',
          }}>{label}</p>
          <p style={{
            fontSize: '1.85rem', fontWeight: 700, color: '#e8f0fe',
            letterSpacing: '-0.02em', lineHeight: 1.1,
          }}>{value}</p>
        </div>
        <div style={{
          width: '46px', height: '46px', borderRadius: '12px',
          background: cfg.grad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 6px 20px ${cfg.glow}`,
        }}>
          <Icon style={{ width: '22px', height: '22px', color: '#fff' }} />
        </div>
      </div>
    </article>
  );
};

/* ══════════════════════════════════════════════
   AdminDashboard — lógica 100% original
   ══════════════════════════════════════════════ */
export const AdminDashboard = () => {
  const { accounts = [], loading: accountsLoading, getAccounts } = useAccountStore();
  const { users = [], fetchUsers, loading: usersLoading } = useUserManagmentStore();
  const [transactions, setTransactions]         = useState([]);
  const [accountRequests, setAccountRequests]   = useState([]);
  const [loadingTransactions, setLoadingTransactions] = React.useState(true);
  const [loadingRequests, setLoadingRequests]   = useState(true);

  /* ── handlers idénticos al original ── */
  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const res  = await getTransactions({ limit: 100 });
      const data = res.data?.transactions ?? res.data?.transaction ?? res.data ?? [];
      setTransactions(Array.isArray(data) ? data : []);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const res  = await getAccountRequests();
      const data = res.data?.requests ?? res.data ?? [];
      setAccountRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error?.response?.data?.message || 'No se pudieron cargar las solicitudes');
    } finally {
      setLoadingRequests(false);
    }
  };

  const refreshAll = () => {
    getAccounts().catch(() => {});
    fetchUsers(undefined, { force: true }).catch(() => {});
    loadTransactions().catch(() => {});
    loadRequests().catch(() => {});
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dashboardStats = useMemo(() => {
    const activeAccounts   = accounts.filter((a) => a.status === 'ACTIVE').length;
    const totalBalance     = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
    const totalTransactions = transactions.length;
    const todayTransactions = transactions.filter((tx) => {
      const date = tx?.createdAt || tx?.date || tx?.created_at;
      if (!date) return false;
      return new Date(date).toDateString() === new Date().toDateString();
    }).length;

    return [
      { label: 'Usuarios',        value: users.length.toLocaleString('es-GT'),         icon: UsersIcon           },
      { label: 'Cuentas',         value: accounts.length.toLocaleString('es-GT'),      icon: BuildingLibraryIcon },
      { label: 'Transacciones',   value: totalTransactions.toLocaleString('es-GT'),    icon: CreditCardIcon      },
      { label: 'Saldo Total',     value: formatMoney(totalBalance),                    icon: BanknotesIcon       },
      { label: 'Cuentas Activas', value: activeAccounts.toLocaleString('es-GT'),       icon: ClockIcon           },
      { label: 'Hoy',             value: todayTransactions.toLocaleString('es-GT'),    icon: CalendarDaysIcon    },
    ];
  }, [accounts, transactions, users.length]);

  const dailySeries = useMemo(() => aggregateByDay(transactions), [transactions]);
  const peakValue   = Math.max(...dailySeries.map((item) => item.value), 1);

  /* ── glass panel helper ── */
  const glassPanel = {
    borderRadius:   '16px',
    background:     'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border:         '1px solid rgba(255,255,255,0.09)',
    boxShadow:      '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
    overflow:       'hidden',
  };

  const sectionTitle = {
    fontFamily:    '"DM Serif Display", Georgia, serif',
    fontSize:      '1rem',
    fontWeight:    400,
    color:         '#e8f0fe',
    display:       'flex',
    alignItems:    'center',
    gap:           '8px',
  };

  return (
    <div style={{
      minHeight:  '100vh',
      padding:    'clamp(16px, 3vw, 32px)',
      background: 'radial-gradient(ellipse 70% 50% at 10% 0%, rgba(79,142,247,0.08) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 90% 100%, rgba(0,212,160,0.06) 0%, transparent 50%), var(--dash-bg, #070d1a)',
    }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>

        {/* ══ Hero Header ══ */}
        <section style={{
          ...glassPanel,
          marginBottom:  '24px',
          padding:       'clamp(24px,4vw,40px) clamp(24px,4vw,40px)',
          position:      'relative',
          background:    'linear-gradient(135deg, rgba(10,37,64,0.9) 0%, rgba(26,75,140,0.7) 55%, rgba(79,142,247,0.15) 100%)',
          border:        '1px solid rgba(79,142,247,0.2)',
        }}>
          {/* Mesh gradients */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            background: 'radial-gradient(ellipse 55% 70% at 90% 10%, rgba(79,142,247,0.2) 0%, transparent 55%), radial-gradient(ellipse 40% 50% at 10% 90%, rgba(0,212,160,0.12) 0%, transparent 50%)',
          }} />
          {/* Grid texture */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(79,142,247,0.8)', marginBottom: '10px' }}>
                Panel de Administración
              </p>
              <h1 style={{
                fontFamily:    '"DM Serif Display", Georgia, serif',
                fontSize:      'clamp(1.8rem, 4vw, 3rem)',
                fontWeight:    400,
                color:         '#e8f0fe',
                letterSpacing: '-0.02em',
                lineHeight:    1.15,
                marginBottom:  '10px',
              }}>
                Dashboard Bancario
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(232,240,254,0.5)', maxWidth: '520px', lineHeight: 1.7 }}>
                Resumen operativo del sistema: usuarios, cuentas, transacciones y comportamiento diario.
              </p>
            </div>

            <button
              onClick={refreshAll}
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            '8px',
                padding:        '12px 22px',
                borderRadius:   '12px',
                background:     'rgba(79,142,247,0.15)',
                border:         '1px solid rgba(79,142,247,0.35)',
                color:          '#a5c8ff',
                fontSize:       '0.845rem',
                fontWeight:     600,
                letterSpacing:  '0.02em',
                cursor:         'pointer',
                backdropFilter: 'blur(10px)',
                transition:     'all 0.2s ease',
                boxShadow:      '0 4px 20px rgba(79,142,247,0.15)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(79,142,247,0.25)';
                e.currentTarget.style.transform  = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(79,142,247,0.15)';
                e.currentTarget.style.transform  = 'translateY(0)';
              }}
            >
              <ArrowPathIcon style={{ width: '16px', height: '16px' }} />
              Actualizar
            </button>
          </div>
        </section>

        {/* ══ Stat Cards ══ */}
        <section style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', marginBottom: '24px' }}>
          {dashboardStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        {/* ══ Charts + Requests ══ */}
        <section style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1.35fr 0.65fr' }}>

          {/* Bar chart */}
          <div style={{ ...glassPanel, padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={sectionTitle}>
                <ChartBarIcon style={{ width: '20px', height: '20px', color: '#4f8ef7' }} />
                Transacciones por día
              </h2>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(232,240,254,0.3)', textTransform: 'uppercase' }}>
                Últimos movimientos
              </span>
            </div>

            {loadingTransactions ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '18rem' }}>
                <Spinner />
              </div>
            ) : (
              <div style={{
                display:        'flex',
                alignItems:     'flex-end',
                gap:            '12px',
                height:         '18rem',
                padding:        '16px 16px 0',
                borderRadius:   '12px',
                background:     'rgba(0,0,0,0.2)',
                border:         '1px solid rgba(255,255,255,0.05)',
              }}>
                {dailySeries.map((item, idx) => {
                  const heightPct = Math.max((item.value / peakValue) * 100, item.value > 0 ? 10 : 3);
                  return (
                    <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', gap: '8px' }}>
                      <div style={{
                        fontSize: '0.65rem', fontWeight: 700, color: 'rgba(232,240,254,0.3)',
                        opacity: item.value > 0 ? 1 : 0, transition: 'opacity 0.2s',
                      }}>
                        {formatMoney(item.value)}
                      </div>
                      <div
                        style={{
                          width:        '100%',
                          maxWidth:     '42px',
                          height:       `${heightPct}%`,
                          borderRadius: '6px 6px 2px 2px',
                          background:   `linear-gradient(180deg, #4f8ef7 0%, rgba(0,212,160,0.7) 100%)`,
                          boxShadow:    item.value > 0 ? '0 0 16px rgba(79,142,247,0.35)' : 'none',
                          transition:   'height 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                          cursor:       'default',
                          position:     'relative',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'linear-gradient(180deg, #6ba3ff 0%, #00d4a0 100%)';
                          e.currentTarget.style.boxShadow  = '0 0 28px rgba(79,142,247,0.6)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'linear-gradient(180deg, #4f8ef7 0%, rgba(0,212,160,0.7) 100%)';
                          e.currentTarget.style.boxShadow  = item.value > 0 ? '0 0 16px rgba(79,142,247,0.35)' : 'none';
                        }}
                      />
                      <div style={{ textAlign: 'center', paddingBottom: '8px' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(232,240,254,0.5)' }}>{item.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Account requests */}
            <div style={{ ...glassPanel, padding: '24px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
                <h2 style={sectionTitle}>
                  <UsersIcon style={{ width: '18px', height: '18px', color: '#4f8ef7' }} />
                  Solicitudes
                </h2>
                <button
                  onClick={loadRequests}
                  style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4f8ef7', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}
                >
                  Refrescar
                </button>
              </div>

              {loadingRequests ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '8rem' }}>
                  <Spinner />
                </div>
              ) : accountRequests.filter((r) => r.status === 'PENDING').length === 0 ? (
                <div style={{
                  borderRadius: '10px', padding: '16px 14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)',
                  fontSize: '0.8rem', color: 'rgba(232,240,254,0.35)', textAlign: 'center',
                }}>
                  Sin solicitudes pendientes
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {accountRequests.filter((r) => r.status === 'PENDING').map((request) => {
                    const requester = users.find((u) => u.id === request.externalUserId || u.uid === request.externalUserId);
                    return (
                      <div key={request._id || request.id} style={{
                        borderRadius: '12px', padding: '14px 16px',
                        background:   'rgba(255,255,255,0.04)',
                        border:       '1px solid rgba(255,255,255,0.08)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                          <div>
                            <p style={{ fontSize: '0.845rem', fontWeight: 600, color: '#e8f0fe', marginBottom: '2px' }}>
                              {requester ? `${requester.name || ''} ${requester.surname || ''}`.trim() : 'Sin perfil'}
                            </p>
                            <p style={{ fontSize: '0.68rem', color: 'rgba(232,240,254,0.35)' }}>
                              {new Date(request.createdAt).toLocaleString('es-GT')}
                            </p>
                          </div>
                          <span style={{
                            padding: '3px 10px', borderRadius: '20px', fontSize: '0.62rem',
                            fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                            background: 'rgba(251,191,36,0.15)', color: '#fbbf24',
                            border: '1px solid rgba(251,191,36,0.3)',
                          }}>
                            Pendiente
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            style={{
                              flex: 1, padding: '8px', borderRadius: '9px', fontSize: '0.78rem',
                              fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(0,212,160,0.3)',
                              background: 'rgba(0,212,160,0.12)', color: '#00d4a0', transition: 'all 0.18s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,160,0.25)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,212,160,0.12)'; }}
                            onClick={async () => {
                              const res = await approveAccountRequest(request._id || request.id);
                              if (res?.data?.success) { showSuccess('Cuenta aprobada'); refreshAll(); }
                              else showError(res?.data?.message || 'No se pudo aprobar');
                            }}
                          >
                            Aprobar
                          </button>
                          <button
                            style={{
                              flex: 1, padding: '8px', borderRadius: '9px', fontSize: '0.78rem',
                              fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(248,113,113,0.3)',
                              background: 'rgba(248,113,113,0.1)', color: '#f87171', transition: 'all 0.18s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.22)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                            onClick={async () => {
                              const res = await rejectAccountRequest(request._id || request.id);
                              if (res?.data?.success) { showSuccess('Solicitud rechazada'); refreshAll(); }
                              else showError(res?.data?.message || 'No se pudo rechazar');
                            }}
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Load status */}
            <div style={{ ...glassPanel, padding: '22px' }}>
              <h2 style={{ ...sectionTitle, marginBottom: '14px' }}>
                <ClockIcon style={{ width: '18px', height: '18px', color: '#4f8ef7' }} />
                Estado de carga
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Usuarios',       val: usersLoading        ? 'cargando…' : users.length,        color: '#4f8ef7' },
                  { label: 'Cuentas',        val: accountsLoading     ? 'cargando…' : accounts.length,     color: '#00d4a0' },
                  { label: 'Transacciones',  val: loadingTransactions ? 'cargando…' : transactions.length, color: '#a78bfa' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(232,240,254,0.45)' }}>{label}</span>
                    <span style={{ fontSize: '0.845rem', fontWeight: 700, color }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div style={{ ...glassPanel, padding: '22px' }}>
              <h2 style={{ ...sectionTitle, marginBottom: '12px' }}>
                <BanknotesIcon style={{ width: '18px', height: '18px', color: '#fbbf24' }} />
                Resumen financiero
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'rgba(232,240,254,0.38)', lineHeight: 1.7 }}>
                Balance consolidado y operativa general. Este espacio puede ampliarse con alertas de riesgo, top clientes y saldos por producto.
              </p>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};