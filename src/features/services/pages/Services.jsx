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
  purchaseProduct,
} from '../../../shared/api/products';
import { normalizeRole } from '../../../shared/utils/authRole';
import { useAuthStore } from '../../auth/store/authStore';
import { useAccountStore } from '../../accounts/store/useAccountStore';
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

import { StatCard } from '../components/StatCard.jsx';
import { ServiceModal } from '../components/ServiceModal.jsx';
import { PurchaseModal } from '../../products/components/PurchaseModal.jsx';
import { GLASS_PANEL } from '../../../shared/constants/glassStyles';

export const Services = () => {
  const { user } = useAuthStore();
  const { accounts = [], getAccounts } = useAccountStore();
  const role    = normalizeRole(user?.role);
  const isAdmin = role === 'ADMIN_ROLE';
  const isClient = role === 'USER_ROLE';

  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({ name: '', description: '', price: '' });
  const [formLoading, setFormLoading] = useState(false);

  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const activeAccounts = useMemo(
    () => accounts.filter((account) => account?.status === 'ACTIVE'),
    [accounts]
  );

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
    fetchServices();
    if (isClient) getAccounts?.().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchServices, isClient]);

  // ── Handlers de formulario/modal (admin) ──
  const handleChange = (e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };

  const openCreateModal = useCallback(() => {
    setEditing(null);
    setForm({ name: '', description: '', price: '' });
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((service) => {
    setEditing(service?._id || service?.id);
    setForm({
      name:        service?.name || '',
      description: service?.description || '',
      price:       service?.price || '',
    });
    setShowModal(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const payload = { ...form, price: Number(form.price), type: 'service' };
    try {
      if (editing) {
        await updateProduct(editing, payload);
        showSuccess('Servicio actualizado');
      } else {
        await createProduct(payload);
        showSuccess('Servicio creado');
      }
      setForm({ name: '', description: '', price: '' });
      setShowModal(false);
      setEditing(null);
      fetchServices();
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'Error al guardar servicio');
    } finally {
      setFormLoading(false);
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

  // ── Handlers de contratación (cliente) ──
  const openPurchaseModal = useCallback((service) => {
    const defaultAccount = activeAccounts[0];
    setSelectedService(service);
    setSelectedAccountId(defaultAccount?._id || defaultAccount?.id || '');
    setPurchaseOpen(true);
  }, [activeAccounts]);

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!selectedService)   { showError('Selecciona un servicio'); return; }
    if (!selectedAccountId) { showError('Selecciona una cuenta activa'); return; }
    setPurchaseLoading(true);
    try {
      const response = await purchaseProduct({
        productId: selectedService._id || selectedService.id,
        accountId: selectedAccountId,
      });
      if (response?.data?.success === false) { showError(response?.data?.message || 'No se pudo contratar el servicio'); return; }
      showSuccess('Servicio contratado correctamente');
      setPurchaseOpen(false);
      setSelectedService(null);
      await Promise.all([fetchServices(), getAccounts?.()]);
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'Error al contratar el servicio');
    } finally {
      setPurchaseLoading(false);
    }
  };

  // ── Derived stats ──
  const activeCount   = services.filter(s => String(s?.isActive) !== 'false' && !!s?.isActive).length;
  const inactiveCount = services.length - activeCount;
  const avgPrice      = services.length > 0
    ? services.reduce((sum, s) => sum + Number(s?.price || 0), 0) / services.length
    : 0;

  // ── glass panel helper ──
  const glassPanel = GLASS_PANEL;

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
                {isAdmin ? 'Servicios Bancarios' : 'Catálogo de Servicios'}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(232,240,254,0.5)', maxWidth: '480px', lineHeight: 1.7 }}>
                {isAdmin
                  ? 'Crea, edita, activa o desactiva los servicios disponibles en el sistema bancario.'
                  : 'Contrata los servicios disponibles usando el saldo de una de tus cuentas.'}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={openCreateModal}
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
                Crear Servicio
              </button>
            )}
          </div>
        </section>

        {/* ══ Stat Cards ══ */}
        <section style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', marginBottom: '24px' }}>
          <StatCard label="Total"    value={services.length} icon={WrenchScrewdriverIcon} grad="linear-gradient(135deg,#a78bfa,#7c3aed)" glow="rgba(167,139,250,0.35)" />
          <StatCard label="Activos"  value={activeCount}     icon={BoltIcon}              grad="linear-gradient(135deg,#00d4a0,#059669)" glow="rgba(0,212,160,0.35)" />
          <StatCard label="Inactivos" value={inactiveCount}  icon={TagIcon}               grad="linear-gradient(135deg,#fbbf24,#d97706)" glow="rgba(251,191,36,0.3)" />
          <StatCard label="Precio Prom." value={moneyFormatter.format(avgPrice)} icon={CurrencyDollarIcon} grad="linear-gradient(135deg,#4f8ef7,#2563eb)" glow="rgba(79,142,247,0.35)" />
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
                          {isAdmin ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {/* Editar */}
                              <button
                                onClick={() => openEditModal(service)}
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
                          ) : (
                            <button
                              onClick={() => openPurchaseModal(service)}
                              disabled={!active}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '7px 16px', borderRadius: '20px',
                                fontSize: '0.75rem', fontWeight: 700,
                                border: 'none', cursor: active ? 'pointer' : 'not-allowed',
                                background: active ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.05)',
                                color: active ? '#c4b5fd' : 'rgba(232,240,254,0.3)',
                                transition: 'all 0.15s',
                              }}
                            >
                              <WrenchScrewdriverIcon style={{ width: '13px', height: '13px' }} />
                              Contratar
                            </button>
                          )}
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

      <ServiceModal
        isOpen={showModal}
        editingId={editing}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => { setShowModal(false); setEditing(null); }}
        loading={formLoading}
      />

      <PurchaseModal
        isOpen={purchaseOpen}
        selectedProduct={selectedService}
        activeAccounts={activeAccounts}
        selectedAccountId={selectedAccountId}
        onAccountChange={setSelectedAccountId}
        onSubmit={handlePurchase}
        onClose={() => { setPurchaseOpen(false); setSelectedService(null); }}
        loading={purchaseLoading}
        moneyFormatter={moneyFormatter}
      />
    </div>
  );
};

export default Services;