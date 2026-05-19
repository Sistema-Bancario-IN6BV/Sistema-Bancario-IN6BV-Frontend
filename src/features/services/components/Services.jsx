// Services.jsx — REDISEÑO VISUAL ÚNICAMENTE
// Toda la lógica, handlers, API calls, estados, roles son idénticos al original
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  activateProduct,
  deactivateProduct,
} from '../../../shared/api/products';
import { normalizeRole } from '../../../shared/utils/authRole';
import { useAuthStore } from '../../auth/store/authStore';
import { showError, showSuccess } from '../../../shared/utils/toast';
import {
  PencilSquareIcon,
  TrashIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  BoltIcon,
  TagIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

// ── Stat Card ──
const StatCard = ({ label, value, icon: Icon, grad, glow }) => (
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
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px', background: grad,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: `0 4px 16px ${glow}`,
      }}>
        <Icon style={{ width: '18px', height: '18px', color: '#fff' }} />
      </div>
    </div>
  </article>
);

export const Services = () => {
  // ── Lógica original intacta ──
  const { user } = useAuthStore();
  const role    = normalizeRole(user?.role);
  const isAdmin = role === 'ADMIN_ROLE';

  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({ name: '', price: 0, description: '', isActive: true });

  const moneyFormatter = useMemo(
    () => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2 }),
    []
  );

  // ── fetchServices original intacto ──
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await getProducts();
      const data = res?.data?.products ?? res?.data ?? [];
      const list = Array.isArray(data)
        ? data.filter(
            (product) =>
              String(product?.type || '').toLowerCase() === 'service' ||
              String(product?.category || '').toLowerCase() === 'service'
          )
        : [];
      setServices(list);
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'No se pudieron cargar servicios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchServices();
  }, [isAdmin, fetchServices]);

  // ── Handlers originales intactos ──
  const openCreate = useCallback(() => {
    setEditing(null);
    setForm({ name: '', price: 0, description: '', isActive: true });
  }, []);

  const openEdit = useCallback((service) => {
    setEditing(service?._id || service?.id);
    setForm({
      name:        service?.name || '',
      price:       Number(service?.price || 0),
      description: service?.description || '',
      isActive:    String(service?.isActive) === 'false' ? false : !!service?.isActive,
    });
  }, []);

  const handleSave = async () => {
    const payload = { ...form, type: 'service' };
    try {
      if (editing) {
        await updateProduct(editing, payload);
        showSuccess('Servicio actualizado');
      } else {
        await createProduct(payload);
        showSuccess('Servicio creado');
      }
      fetchServices();
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'Error al guardar servicio');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar servicio?')) return;
    try {
      await deleteProduct(id);
      showSuccess('Servicio eliminado');
      fetchServices();
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'No se pudo eliminar');
    }
  };

  const toggleActive = async (id, active) => {
    try {
      if (active) await deactivateProduct(id); else await activateProduct(id);
      fetchServices();
    } catch {
      showError('No se pudo cambiar estado');
    }
  };

  // ── Derived stats ──
  const activeCount   = services.filter(s => String(s?.isActive) !== 'false' && !!s?.isActive).length;
  const inactiveCount = services.length - activeCount;
  const avgPrice      = services.length > 0
    ? services.reduce((sum, s) => sum + Number(s?.price || 0), 0) / services.length
    : 0;

  // ── glass panel helper ──
  const glassPanel = {
    borderRadius:   '16px',
    background:     'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border:         '1px solid rgba(255,255,255,0.09)',
    boxShadow:      '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
    overflow:       'hidden',
  };

  // ── Vista para usuarios sin permisos — lógica original intacta ──
  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px', background: 'var(--dash-bg, #070d1a)',
      }}>
        <div style={{
          ...glassPanel,
          padding: '48px', textAlign: 'center', maxWidth: '420px', width: '100%',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(248,113,113,0.12)',
            border: '1px solid rgba(248,113,113,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <WrenchScrewdriverIcon style={{ width: '24px', height: '24px', color: '#f87171' }} />
          </div>
          <h1 style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: '1.6rem', fontWeight: 400, color: '#e8f0fe', marginBottom: '10px',
          }}>Servicios</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(232,240,254,0.4)', lineHeight: 1.7 }}>
            No tienes permisos para administrar servicios. Esta sección es exclusiva para <strong style={{ color: '#a5c8ff' }}>ADMIN_ROLE</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'clamp(16px, 3vw, 32px)',
      background: 'radial-gradient(ellipse 70% 50% at 90% 0%, rgba(167,139,250,0.07) 0%, transparent 55%), var(--dash-bg, #070d1a)',
    }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>

        {/* ══ Hero Header ══ */}
        <section style={{
          ...glassPanel,
          marginBottom: '24px',
          padding: 'clamp(24px,4vw,40px)',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(10,37,64,0.92) 0%, rgba(60,30,100,0.6) 55%, rgba(167,139,250,0.12) 100%)',
          border: '1px solid rgba(167,139,250,0.2)',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            background: 'radial-gradient(ellipse 55% 70% at 90% 10%, rgba(167,139,250,0.15) 0%, transparent 55%), radial-gradient(ellipse 40% 50% at 10% 90%, rgba(0,212,160,0.08) 0%, transparent 50%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.85)', marginBottom: '10px' }}>
                Administración
              </p>
              <h1 style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: 'clamp(1.8rem,4vw,2.8rem)',
                fontWeight: 400, color: '#e8f0fe',
                letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '10px',
              }}>
                Servicios Bancarios
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(232,240,254,0.5)', maxWidth: '480px', lineHeight: 1.7 }}>
                Crea, edita, activa o desactiva los servicios disponibles en el sistema bancario.
              </p>
            </div>
            {/* Botones — onClick originales intactos */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={openCreate}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '11px 20px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: 'rgba(232,240,254,0.75)', fontSize: '0.875rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              >
                Limpiar
              </button>
              <button
                onClick={handleSave}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '11px 22px', borderRadius: '12px',
                  background: 'rgba(167,139,250,0.18)',
                  border: '1px solid rgba(167,139,250,0.4)',
                  color: '#c4b5fd', fontSize: '0.875rem', fontWeight: 600,
                  cursor: 'pointer', backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 20px rgba(167,139,250,0.18)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.28)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.18)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <PlusIcon style={{ width: '15px', height: '15px' }} />
                {editing ? 'Actualizar' : 'Crear servicio'}
              </button>
            </div>
          </div>
        </section>

        {/* ══ Stat Cards ══ */}
        <section style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', marginBottom: '24px' }}>
          <StatCard label="Total"    value={services.length} icon={WrenchScrewdriverIcon} grad="linear-gradient(135deg,#a78bfa,#7c3aed)" glow="rgba(167,139,250,0.35)" />
          <StatCard label="Activos"  value={activeCount}     icon={BoltIcon}              grad="linear-gradient(135deg,#00d4a0,#059669)" glow="rgba(0,212,160,0.35)" />
          <StatCard label="Inactivos" value={inactiveCount}  icon={TagIcon}               grad="linear-gradient(135deg,#fbbf24,#d97706)" glow="rgba(251,191,36,0.3)" />
          <StatCard label="Precio Prom." value={moneyFormatter.format(avgPrice)} icon={CurrencyDollarIcon} grad="linear-gradient(135deg,#4f8ef7,#2563eb)" glow="rgba(79,142,247,0.35)" />
        </section>

        {/* ══ Formulario de creación/edición ══ */}
        <section style={{ ...glassPanel, marginBottom: '20px', padding: '24px 28px' }}>
          <p style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'rgba(167,139,250,0.7)', marginBottom: '16px',
          }}>
            {editing ? 'Editar servicio' : 'Nuevo servicio'}
          </p>

          <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))' }}>
            {/* Nombre — value, onChange originales intactos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(232,240,254,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nombre</label>
              <input
                placeholder="Ej. Pago de luz"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{
                  padding: '10px 13px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  fontFamily: 'inherit', fontSize: '0.875rem', color: '#e8f0fe',
                  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(167,139,250,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Precio — value, onChange originales intactos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(232,240,254,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Precio</label>
              <input
                placeholder="0.00"
                type="number" min="0" step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                style={{
                  padding: '10px 13px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  fontFamily: 'inherit', fontSize: '0.875rem', color: '#e8f0fe',
                  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(167,139,250,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Estado — value, onChange originales intactos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(232,240,254,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Estado</label>
              <select
                value={form.isActive ? '1' : '0'}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === '1' })}
                style={{
                  padding: '10px 32px 10px 13px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  fontFamily: 'inherit', fontSize: '0.875rem', color: '#e8f0fe',
                  outline: 'none', cursor: 'pointer', appearance: 'none',
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(232,240,254,0.4)' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
                }}
              >
                <option value="1" style={{ background: '#0a2540' }}>Activo</option>
                <option value="0" style={{ background: '#0a2540' }}>Inactivo</option>
              </select>
            </div>

            {/* Descripción — value, onChange originales intactos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(232,240,254,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Descripción</label>
              <textarea
                placeholder="Describe el servicio..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{
                  padding: '10px 13px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  fontFamily: 'inherit', fontSize: '0.875rem', color: '#e8f0fe',
                  outline: 'none', resize: 'vertical',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(167,139,250,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Acciones del form — onClick originales intactos */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={openCreate}
              style={{
                padding: '9px 18px', borderRadius: '9px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(232,240,254,0.6)', fontSize: '0.845rem', fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '9px 22px', borderRadius: '9px',
                background: 'rgba(167,139,250,0.15)',
                border: '1px solid rgba(167,139,250,0.35)',
                color: '#c4b5fd', fontSize: '0.845rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {editing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </section>

        {/* ══ Tabla de servicios ══ */}
        <section style={{ ...glassPanel }}>
          {/* Cabecera */}
          <div style={{ padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Servicio', 'Precio', 'Estado', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '14px 0',
                      textAlign: i === 1 ? 'right' : i === 3 ? 'right' : 'left',
                      fontSize: '0.65rem', fontWeight: 700,
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                      color: 'rgba(232,240,254,0.35)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>

          {/* Body */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'rgba(232,240,254,0.4)', fontSize: '0.875rem' }}>
                        <span style={{
                          width: '20px', height: '20px', border: '2px solid rgba(167,139,250,0.25)',
                          borderTopColor: '#a78bfa', borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite', display: 'inline-block',
                        }} />
                        Cargando servicios...
                      </div>
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <WrenchScrewdriverIcon style={{ width: '36px', height: '36px', color: 'rgba(232,240,254,0.15)', margin: '0 auto 12px', display: 'block' }} />
                      <p style={{ color: 'rgba(232,240,254,0.35)', fontSize: '0.875rem' }}>No hay servicios registrados.</p>
                    </td>
                  </tr>
                ) : (
                  services.map((service, idx) => {
                    const id     = service?._id || service?.id;
                    const active = String(service?.isActive) === 'false' ? false : !!service?.isActive;
                    return (
                      <tr
                        key={id}
                        style={{
                          borderBottom: idx < services.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Nombre + descripción */}
                        <td style={{ padding: '15px 24px', verticalAlign: 'middle' }}>
                          <p style={{ fontWeight: 500, color: '#e8f0fe', fontSize: '0.875rem', marginBottom: '2px' }}>
                            {service?.name}
                          </p>
                          <p style={{ fontSize: '0.78rem', color: 'rgba(232,240,254,0.38)' }}>
                            {service?.description || '—'}
                          </p>
                        </td>
                        {/* Precio */}
                        <td style={{ padding: '15px 24px', verticalAlign: 'middle', textAlign: 'right', fontWeight: 600, color: '#e8f0fe', fontSize: '0.875rem' }}>
                          {moneyFormatter.format(Number(service?.price || 0))}
                        </td>
                        {/* Estado */}
                        <td style={{ padding: '15px 24px', verticalAlign: 'middle' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '3px 10px', borderRadius: '20px',
                            fontSize: '0.68rem', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            ...(active
                              ? { background: 'rgba(0,212,160,0.12)', border: '1px solid rgba(0,212,160,0.3)', color: '#00d4a0' }
                              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(232,240,254,0.4)' }
                            ),
                          }}>
                            {active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        {/* Acciones — onClick originales intactos */}
                        <td style={{ padding: '15px 24px', verticalAlign: 'middle', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {/* Editar */}
                            <button
                              onClick={() => openEdit(service)}
                              title="Editar" aria-label="Editar"
                              style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'rgba(79,142,247,0.1)',
                                border: '1px solid rgba(79,142,247,0.25)',
                                color: '#a5c8ff', cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.22)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                              <PencilSquareIcon style={{ width: '14px', height: '14px' }} />
                            </button>
                            {/* Eliminar */}
                            <button
                              onClick={() => handleDelete(id)}
                              title="Eliminar" aria-label="Eliminar"
                              style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'rgba(248,113,113,0.1)',
                                border: '1px solid rgba(248,113,113,0.25)',
                                color: '#f87171', cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.22)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                              <TrashIcon style={{ width: '14px', height: '14px' }} />
                            </button>
                            {/* Toggle activo/inactivo */}
                            <button
                              onClick={() => toggleActive(id, active)}
                              title={active ? 'Desactivar' : 'Activar'}
                              aria-label={active ? 'Desactivar' : 'Activar'}
                              style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: active ? 'rgba(251,191,36,0.1)' : 'rgba(0,212,160,0.1)',
                                border: active ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(0,212,160,0.25)',
                                color: active ? '#fbbf24' : '#00d4a0', cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '0.8'; }}
                              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1'; }}
                            >
                              {active
                                ? <NoSymbolIcon     style={{ width: '14px', height: '14px' }} />
                                : <CheckCircleIcon  style={{ width: '14px', height: '14px' }} />
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Services;