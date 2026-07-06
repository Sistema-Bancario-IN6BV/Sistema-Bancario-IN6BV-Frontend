// Products.jsx — REDISEÑO VISUAL ÚNICAMENTE
// Toda la lógica, estados, efectos, handlers, API calls son idénticos al original
import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import {
  getProducts,
  createProduct,
  updateProduct,
  activateProduct,
  deactivateProduct,
  purchaseProduct,
  getPurchasedProductsByAccount,
} from '../../../shared/api/products';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { normalizeRole } from '../../../shared/utils/authRole';
import { parseDate } from '../../../shared/utils/date';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  TagIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  PencilIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { ProductModal } from '../components/ProductModal.jsx';
import { PurchaseModal } from '../components/PurchaseModal.jsx';
import { StatCard } from '../../services/components/StatCard.jsx';
import { GLASS_PANEL } from '../../../shared/constants/glassStyles';

const glassPanel = GLASS_PANEL;

export const Products = () => {
  // ── Estado y lógica originales 100% intactos ──
  const { user }                         = useAuthStore();
  const { accounts = [], getAccounts }   = useAccountStore();
  const [products,         setProducts]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [showModal,        setShowModal]        = useState(false);
  const [searchTerm,       setSearchTerm]       = useState('');
  const [statusFilter,     setStatusFilter]     = useState('all');
  const [currentPage,      setCurrentPage]      = useState(1);
  const [editingId,        setEditingId]        = useState(null);
  const [form,             setForm]             = useState({ name: '', description: '', price: '' });
  const [formLoading,      setFormLoading]      = useState(false);
  const [purchaseOpen,     setPurchaseOpen]     = useState(false);
  const [selectedProduct,  setSelectedProduct]  = useState(null);
  const [selectedAccountId,setSelectedAccountId] = useState('');
  const [purchaseLoading,  setPurchaseLoading]  = useState(false);
  const [purchaseHistory,  setPurchaseHistory]  = useState([]);
  const [historyLoading,   setHistoryLoading]   = useState(false);
  const itemsPerPage    = 10;
  const normalizedRole  = normalizeRole(user?.role);
  const isAdmin         = normalizedRole === 'ADMIN_ROLE';
  const isClient        = normalizedRole === 'USER_ROLE';

  const activeAccounts = useMemo(
    () => accounts.filter((account) => account?.status === 'ACTIVE'),
    [accounts]
  );

  const moneyFormatter = useMemo(
    () => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2 }),
    []
  );

  // ── Efectos originales intactos ──
  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    if (!isClient) return;
    const loadClientContext = async () => {
      try {
        const loadedAccounts = await getAccounts();
        const accountList    = Array.isArray(loadedAccounts) ? loadedAccounts : [];
        const accountIds     = accountList.map((a) => a?._id || a?.id).filter(Boolean);
        if (accountIds.length === 0) { setPurchaseHistory([]); return; }
        const results = await Promise.allSettled(
          accountIds.map((accountId) => getPurchasedProductsByAccount(accountId))
        );
        const mergedHistory = results.flatMap((result, index) => {
          if (result.status !== 'fulfilled') return [];
          const accountId = accountIds[index];
          const data      = result.value?.data?.purchases ?? result.value?.data ?? [];
          const purchases = Array.isArray(data) ? data : [];
          return purchases.map((purchase) => ({ ...purchase, accountId }));
        });
        mergedHistory.sort((l, r) => (parseDate(r?.createdAt || r?.date || 0)?.getTime() || 0) - (parseDate(l?.createdAt || l?.date || 0)?.getTime() || 0));
        setPurchaseHistory(mergedHistory);
      } catch (error) { console.warn('No se pudo cargar el contexto de compras:', error); }
    };
    loadClientContext().catch((err) => console.warn('loadClientContext failed:', err));
  }, [isClient, getAccounts]);

  useEffect(() => { if (!isAdmin) setStatusFilter('active'); }, [isAdmin]);

  // ── fetchProducts original intacto ──
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts();
      let productsData = response.data?.products || response.data?.data || response.data || [];
      if (productsData && !Array.isArray(productsData) && typeof productsData === 'object') {
        productsData = Object.values(productsData);
      }
      const finalProducts = Array.isArray(productsData) ? productsData : [];
      const nonServiceProducts = finalProducts.filter(p => String(p?.type || '').toLowerCase() !== 'service');
      const normalized    = nonServiceProducts.map(p => {
        const raw         = p?.isActive;
        const isActiveBool = typeof raw === 'boolean' ? raw
          : typeof raw === 'string'  ? raw === 'true' || raw === '1'
          : typeof raw === 'number'  ? raw === 1
          : !!raw;
        return { ...p, isActive: isActiveBool };
      });
      setProducts(normalized);
    } catch (err) {
      showError('Error al cargar productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseHistory = async (accountList = accounts) => {
    if (!isClient) { setPurchaseHistory([]); return; }
    const accountIds = (accountList || []).map((a) => a?._id || a?.id).filter(Boolean);
    if (accountIds.length === 0) { setPurchaseHistory([]); return; }
    setHistoryLoading(true);
    try {
      const results = await Promise.allSettled(
        accountIds.map((accountId) => getPurchasedProductsByAccount(accountId))
      );
      const mergedHistory = results.flatMap((result, index) => {
        if (result.status !== 'fulfilled') return [];
        const accountId = accountIds[index];
        const data      = result.value?.data?.purchases ?? result.value?.data ?? [];
        const purchases = Array.isArray(data) ? data : [];
        return purchases.map((purchase) => ({ ...purchase, accountId }));
      });
      mergedHistory.sort((l, r) => (parseDate(r?.createdAt || r?.date || 0)?.getTime() || 0) - (parseDate(l?.createdAt || l?.date || 0)?.getTime() || 0));
      setPurchaseHistory(mergedHistory);
    } catch (error) {
      console.warn('No se pudo cargar el historial de compras:', error);
      setPurchaseHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ── Filtrado y paginación originales intactos ──
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const search = (searchTerm || '').toLowerCase().trim();
    let result = products.slice();
    if (!isAdmin) result = result.filter(p => p?.isActive);
    if (statusFilter === 'active')   result = result.filter(p => p?.isActive);
    if (statusFilter === 'inactive') result = result.filter(p => !p?.isActive);
    if (!search) return result;
    return result.filter(p => {
      const name        = (p?.name        || '').toLowerCase();
      const description = (p?.description || '').toLowerCase();
      return name.includes(search) || description.includes(search);
    });
  }, [products, searchTerm, statusFilter, isAdmin]);

  const totalPages       = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  // ── Handlers originales intactos ──
  const handleChange       = (e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };
  const openCreateModal    = () => { setEditingId(null); setForm({ name: '', description: '', price: '' }); setShowModal(true); };
  const openEditModal      = (product) => {
    const productId = product?._id || product?.id;
    setEditingId(productId);
    setForm({ name: product?.name || '', description: product?.description || '', price: product?.price || '' });
    setShowModal(true);
  };
  const openPurchaseModal  = (product) => {
    const defaultAccount = activeAccounts[0];
    setSelectedProduct(product);
    setSelectedAccountId(defaultAccount?._id || defaultAccount?.id || '');
    setPurchaseOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editingId) {
        await updateProduct(editingId, payload);
        showSuccess('Producto actualizado correctamente');
      } else {
        await createProduct(payload);
        showSuccess('Producto creado correctamente');
      }
      setForm({ name: '', description: '', price: '' });
      setShowModal(false);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'Error al guardar producto');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!selectedProduct)  { showError('Selecciona un producto'); return; }
    if (!selectedAccountId){ showError('Selecciona una cuenta activa'); return; }
    setPurchaseLoading(true);
    try {
      const response = await purchaseProduct({
        productId: selectedProduct._id || selectedProduct.id,
        accountId: selectedAccountId,
      });
      if (response?.data?.success === false) { showError(response?.data?.message || 'No se pudo completar la compra'); return; }
      showSuccess('Producto comprado correctamente');
      setPurchaseOpen(false);
      setSelectedProduct(null);
      await Promise.all([fetchProducts(), getAccounts(), fetchPurchaseHistory()]);
    } catch (error) {
      showError(error?.response?.data?.message || error.message || 'Error al comprar producto');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleToggleActive = async (productId, isCurrentlyActive) => {
    try {
      if (isCurrentlyActive) await deactivateProduct(productId); else await activateProduct(productId);
      showSuccess(isCurrentlyActive ? 'Producto desactivado' : 'Producto activado');
      fetchProducts();
    } catch (error) {
      showError('Error al cambiar estado del producto');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'clamp(16px, 3vw, 32px)',
      background: 'radial-gradient(ellipse 70% 50% at 10% 0%, rgba(79,142,247,0.07) 0%, transparent 55%), var(--dash-bg, #070d1a)',
    }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ══ Hero Header ══ */}
        <section style={{
          ...glassPanel,
          padding: 'clamp(24px,4vw,40px)',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(10,37,64,0.92) 0%, rgba(26,75,140,0.72) 55%, rgba(79,142,247,0.14) 100%)',
          border: '1px solid rgba(79,142,247,0.2)',
        }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            background: 'radial-gradient(ellipse 55% 70% at 90% 10%, rgba(79,142,247,0.18) 0%, transparent 55%), radial-gradient(ellipse 40% 50% at 10% 90%, rgba(0,212,160,0.1) 0%, transparent 50%)' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                borderRadius: '20px', border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.07)',
                padding: '4px 14px', marginBottom: '12px',
                fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(232,240,254,0.7)',
              }}>
                <TagIcon style={{ width: '12px', height: '12px' }} />
                Catálogo Financiero
              </div>
              <h1 style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: 'clamp(1.8rem,4vw,2.8rem)',
                fontWeight: 400, color: '#e8f0fe',
                letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '10px',
              }}>
                {isAdmin ? 'Productos Bancarios' : 'Catálogo de Productos'}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(232,240,254,0.5)', maxWidth: '500px', lineHeight: 1.7 }}>
                {isAdmin
                  ? 'Gestión de carteras, préstamos y cuentas especiales. Define la oferta comercial del banco.'
                  : 'Explora la oferta activa y compra productos desde una de tus cuentas.'}
              </p>
            </div>
            {/* Botón Crear / badge — onClick original intacto */}
            {isAdmin ? (
              <button
                onClick={openCreateModal}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '11px 22px', borderRadius: '12px',
                  background: 'rgba(79,142,247,0.18)',
                  border: '1px solid rgba(79,142,247,0.4)',
                  color: '#a5c8ff', fontSize: '0.875rem', fontWeight: 600,
                  cursor: 'pointer', backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 20px rgba(79,142,247,0.18)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.28)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.18)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <PlusIcon style={{ width: '15px', height: '15px' }} />
                Crear Producto
              </button>
            ) : (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 20px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(232,240,254,0.7)', fontSize: '0.875rem', fontWeight: 600,
              }}>
                <ShoppingBagIcon style={{ width: '15px', height: '15px' }} />
                Solo productos activos
              </div>
            )}
          </div>
        </section>

        {/* ══ Stat Cards ══ */}
        <section style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))' }}>
          {[
            { label: 'Total de Productos', value: products.length,                                                                                                                   icon: BuildingStorefrontIcon, grad: 'linear-gradient(135deg,#4f8ef7,#2563eb)',  glow: 'rgba(79,142,247,0.35)'   },
            { label: 'Precio Promedio',    value: products.length > 0 ? `Q ${(products.reduce((s,p) => s + (Number(p.price)||0), 0) / products.length).toFixed(2)}` : 'Q 0',         icon: CurrencyDollarIcon,     grad: 'linear-gradient(135deg,#00d4a0,#059669)', glow: 'rgba(0,212,160,0.35)'    },
            { label: 'Activos',            value: products.filter(p => p.isActive).length,                                                                                           icon: ShieldCheckIcon,        grad: 'linear-gradient(135deg,#a78bfa,#7c3aed)', glow: 'rgba(167,139,250,0.35)'  },
            { label: 'Inactivos',          value: products.filter(p => !p.isActive).length,                                                                                          icon: TagIcon,                grad: 'linear-gradient(135deg,#fbbf24,#d97706)', glow: 'rgba(251,191,36,0.3)'    },
          ].map(stat => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        {/* ══ Barra de búsqueda / filtros ══ */}
        <section style={{ ...glassPanel, padding: '16px 20px' }}>
          <div style={{ position: 'relative', marginBottom: isAdmin ? '14px' : 0 }}>
            <MagnifyingGlassIcon style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'rgba(232,240,254,0.35)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px 10px 40px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                fontFamily: 'inherit', fontSize: '0.875rem', color: '#e8f0fe',
                outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(79,142,247,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Filtro de estado — solo admin, onClick originales intactos */}
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(232,240,254,0.4)' }}>Mostrar:</span>
              <div style={{ display: 'inline-flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                {['all', 'active', 'inactive'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStatusFilter(f)}
                    style={{
                      padding: '6px 14px', fontSize: '0.78rem', fontWeight: 500,
                      border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                      background: statusFilter === f ? 'rgba(79,142,247,0.28)' : 'rgba(255,255,255,0.04)',
                      color: statusFilter === f ? '#a5c8ff' : 'rgba(232,240,254,0.45)',
                      borderRight: f !== 'inactive' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    }}
                  >
                    {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Inactivos'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ══ Tabla de productos ══ */}
        <section style={{ ...glassPanel }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <span style={{ width: '28px', height: '28px', border: '2px solid rgba(79,142,247,0.25)', borderTopColor: '#4f8ef7', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                <p style={{ color: 'rgba(232,240,254,0.4)', fontSize: '0.875rem' }}>Cargando productos...</p>
              </div>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '72px 24px' }}>
              <BuildingStorefrontIcon style={{ width: '40px', height: '40px', color: 'rgba(232,240,254,0.15)', marginBottom: '14px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#e8f0fe', marginBottom: '6px' }}>
                {searchTerm ? 'No se encontraron productos' : 'Sin productos'}
              </h3>
              <p style={{ color: 'rgba(232,240,254,0.38)', fontSize: '0.875rem' }}>
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer producto para comenzar'}
              </p>
            </div>
          ) : (
            <>
              {/* Header fijo */}
              <div style={{ padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Nombre', 'Descripción', 'Precio', 'Estado', 'Acciones'].map((h, i) => (
                        <th key={i} style={{
                          padding: '14px 0',
                          textAlign: i === 2 ? 'right' : i === 3 || i === 4 ? 'center' : 'left',
                          fontSize: '0.65rem', fontWeight: 700,
                          letterSpacing: '0.14em', textTransform: 'uppercase',
                          color: 'rgba(232,240,254,0.35)',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                </table>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {paginatedProducts.map((product, idx) => {
                      const productId = product?._id || product?.id || `product-${idx}`;
                      return (
                        <tr
                          key={productId}
                          style={{
                            borderBottom: idx < paginatedProducts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Nombre */}
                          <td style={{ padding: '15px 24px', verticalAlign: 'middle', fontWeight: 500, color: '#e8f0fe', fontSize: '0.875rem' }}>
                            {product?.name || 'Sin nombre'}
                          </td>
                          {/* Descripción */}
                          <td style={{ padding: '15px 24px', verticalAlign: 'middle', color: 'rgba(232,240,254,0.45)', fontSize: '0.845rem', maxWidth: '240px' }}>
                            <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {product?.description || '-'}
                            </span>
                          </td>
                          {/* Precio */}
                          <td style={{ padding: '15px 24px', verticalAlign: 'middle', textAlign: 'right', fontWeight: 600, color: '#e8f0fe', fontSize: '0.875rem' }}>
                            Q {(Number(product?.price) || 0).toFixed(2)}
                          </td>
                          {/* Estado / Comprar — onClick original intacto */}
                          <td style={{ padding: '15px 24px', verticalAlign: 'middle', textAlign: 'center' }}>
                            <button
                              onClick={() => isAdmin ? handleToggleActive(productId, product?.isActive) : openPurchaseModal(product)}
                              disabled={!isAdmin && !product?.isActive}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '4px 12px', borderRadius: '20px',
                                fontSize: '0.68rem', fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                                border: 'none', cursor: (!isAdmin && !product?.isActive) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s',
                                ...(isAdmin
                                  ? (product?.isActive
                                    ? { background: 'rgba(0,212,160,0.12)', border: '1px solid rgba(0,212,160,0.3)', color: '#00d4a0' }
                                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,240,254,0.4)' })
                                  : (product?.isActive
                                    ? { background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.3)', color: '#a5c8ff' }
                                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(232,240,254,0.25)' })
                                ),
                              }}
                            >
                              {isAdmin ? (
                                product?.isActive
                                  ? <><CheckIcon style={{ width: '12px', height: '12px' }} /> Activo</>
                                  : <><XMarkIcon style={{ width: '12px', height: '12px' }} /> Inactivo</>
                              ) : (
                                <><ShoppingBagIcon style={{ width: '12px', height: '12px' }} /> Comprar</>
                              )}
                            </button>
                          </td>
                          {/* Acciones — onClick original intacto */}
                          <td style={{ padding: '15px 24px', verticalAlign: 'middle', textAlign: 'center' }}>
                            {isAdmin ? (
                              <button
                                onClick={() => openEditModal(product)}
                                title="Editar"
                                style={{
                                  width: '32px', height: '32px', borderRadius: '8px',
                                  background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.25)',
                                  color: '#a5c8ff', cursor: 'pointer',
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.22)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                              >
                                <PencilIcon style={{ width: '14px', height: '14px' }} />
                              </button>
                            ) : (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '4px 10px', borderRadius: '20px',
                                fontSize: '0.68rem', fontWeight: 600,
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(232,240,254,0.4)',
                              }}>
                                <CheckCircleIcon style={{ width: '12px', height: '12px' }} />
                                {product?.isActive ? 'Disponible' : 'No disponible'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación — onClick originales intactos */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.07)',
                  flexWrap: 'wrap', gap: '10px',
                }}>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(232,240,254,0.35)' }}>
                    Página <strong style={{ color: '#e8f0fe' }}>{currentPage}</strong> de <strong style={{ color: '#e8f0fe' }}>{totalPages}</strong> — {filteredProducts.length} resultados
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { label: 'Anterior', icon: ChevronLeftIcon, onClick: () => setCurrentPage(p => Math.max(1, p - 1)), disabled: currentPage === 1 },
                      { label: 'Siguiente', icon: ChevronRightIcon, onClick: () => setCurrentPage(p => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages },
                    ].map(({ label, icon: Icon, onClick, disabled }) => (
                      <button
                        key={label}
                        onClick={onClick}
                        disabled={disabled}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '7px 13px', borderRadius: '8px',
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(232,240,254,0.6)', fontSize: '0.78rem', fontWeight: 500,
                          cursor: 'pointer', transition: 'all 0.15s',
                          opacity: disabled ? 0.35 : 1,
                        }}
                        onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(79,142,247,0.12)'; }}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      >
                        {label === 'Anterior' && <Icon style={{ width: '14px', height: '14px' }} />}
                        {label}
                        {label === 'Siguiente' && <Icon style={{ width: '14px', height: '14px' }} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* ══ Panel de cliente: historial + cuentas ══ */}
        {isClient && (
          <section style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1.15fr 0.85fr' }}>
            {/* Historial — lógica original intacta */}
            <div style={{ ...glassPanel, padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div>
                  <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(232,240,254,0.38)', marginBottom: '4px' }}>Compras recientes</p>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#e8f0fe' }}>Historial de productos</h3>
                </div>
                <ShoppingBagIcon style={{ width: '20px', height: '20px', color: '#4f8ef7' }} />
              </div>
              {historyLoading ? (
                <p style={{ color: 'rgba(232,240,254,0.38)', fontSize: '0.875rem' }}>Cargando historial...</p>
              ) : purchaseHistory.length === 0 ? (
                <p style={{ color: 'rgba(232,240,254,0.35)', fontSize: '0.875rem' }}>Todavía no has comprado productos.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {purchaseHistory.slice(0, 6).map((purchase) => (
                    <div key={purchase?._id || purchase?.id} style={{
                      borderRadius: '12px', padding: '14px 16px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <div>
                          <p style={{ fontWeight: 500, color: '#e8f0fe', fontSize: '0.875rem', marginBottom: '2px' }}>{purchase?.description || 'Compra de producto'}</p>
                          <p style={{ fontSize: '0.72rem', color: 'rgba(232,240,254,0.35)' }}>Cuenta: {purchase?.accountId || '-'}</p>
                        </div>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px',
                          background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)',
                          color: '#a5c8ff', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap',
                        }}>
                          {moneyFormatter.format(Number(purchase?.amount || 0))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cuentas disponibles — lógica original intacta */}
            <div style={{ ...glassPanel, padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div>
                  <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(232,240,254,0.38)', marginBottom: '4px' }}>Cuentas disponibles</p>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#e8f0fe' }}>Cuenta para comprar</h3>
                </div>
                <CheckCircleIcon style={{ width: '20px', height: '20px', color: '#00d4a0' }} />
              </div>
              {activeAccounts.length === 0 ? (
                <p style={{ color: 'rgba(232,240,254,0.35)', fontSize: '0.875rem' }}>Necesitas una cuenta activa para comprar productos.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeAccounts.map((account) => (
                    <div key={account?._id || account?.id} style={{
                      borderRadius: '12px', padding: '14px 16px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      <p style={{ fontWeight: 500, color: '#e8f0fe', fontSize: '0.875rem', marginBottom: '2px' }}>{account?.accountNumber || 'Cuenta'}</p>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(232,240,254,0.45)' }}>Saldo: {moneyFormatter.format(Number(account?.balance || 0))}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <ProductModal
          isOpen={showModal}
          editingId={editingId}
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => { setShowModal(false); setEditingId(null); }}
          loading={formLoading}
        />

        <PurchaseModal
          isOpen={purchaseOpen}
          selectedProduct={selectedProduct}
          activeAccounts={activeAccounts}
          selectedAccountId={selectedAccountId}
          onAccountChange={setSelectedAccountId}
          onSubmit={handlePurchase}
          onClose={() => { setPurchaseOpen(false); setSelectedProduct(null); }}
          loading={purchaseLoading}
          moneyFormatter={moneyFormatter}
        />

      </div>
    </div>
  );
};