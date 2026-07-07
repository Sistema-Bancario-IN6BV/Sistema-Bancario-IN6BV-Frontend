import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import {
  getProducts, createProduct, updateProduct, activateProduct,
  deactivateProduct, purchaseProduct, getPurchasedProductsByAccount,
} from '../../../shared/api/products';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { normalizeRole } from '../../../shared/utils/authRole';

const ITEMS_PER_PAGE = 10;

export const useProducts = () => {
  const { user }                       = useAuthStore();
  const { accounts = [], getAccounts } = useAccountStore();

  const normalizedRole = normalizeRole(user?.role);
  const isAdmin        = normalizedRole === 'ADMIN_ROLE';
  const isClient       = normalizedRole === 'USER_ROLE';

  const [products,          setProducts]          = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [showModal,         setShowModal]         = useState(false);
  const [searchTerm,        setSearchTerm]        = useState('');
  const [statusFilter,      setStatusFilter]      = useState('all');
  const [currentPage,       setCurrentPage]       = useState(1);
  const [editingId,         setEditingId]         = useState(null);
  const [form,              setForm]              = useState({ name: '', description: '', price: '' });
  const [formLoading,       setFormLoading]       = useState(false);
  const [purchaseOpen,      setPurchaseOpen]      = useState(false);
  const [selectedProduct,   setSelectedProduct]   = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [purchaseLoading,   setPurchaseLoading]   = useState(false);
  const [purchaseHistory,   setPurchaseHistory]   = useState([]);
  const [historyLoading,    setHistoryLoading]    = useState(false);

  const activeAccounts = useMemo(() => accounts.filter(a => a?.status === 'ACTIVE'), [accounts]);
  const moneyFormatter = useMemo(
    () => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2 }),
    []
  );

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response   = await getProducts();
      let productsData = response.data?.products || response.data?.data || response.data || [];
      if (productsData && !Array.isArray(productsData) && typeof productsData === 'object')
        productsData = Object.values(productsData);
      const finalProducts    = Array.isArray(productsData) ? productsData : [];
      const nonServiceProducts = finalProducts.filter(p => String(p?.type || '').toLowerCase() !== 'service');
      const normalized = nonServiceProducts.map(p => {
        const raw        = p?.isActive;
        const isActiveBool = typeof raw === 'boolean' ? raw
          : typeof raw === 'string'  ? raw === 'true' || raw === '1'
          : typeof raw === 'number'  ? raw === 1 : !!raw;
        return { ...p, isActive: isActiveBool };
      });
      setProducts(normalized);
    } catch {
      showError('Error al cargar productos'); setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseHistory = async (accountList = accounts) => {
    if (!isClient) { setPurchaseHistory([]); return; }
    const accountIds = (accountList || []).map(a => a?._id || a?.id).filter(Boolean);
    if (accountIds.length === 0) { setPurchaseHistory([]); return; }
    setHistoryLoading(true);
    try {
      const results = await Promise.allSettled(accountIds.map(id => getPurchasedProductsByAccount(id)));
      const merged  = results.flatMap((result, index) => {
        if (result.status !== 'fulfilled') return [];
        const accountId = accountIds[index];
        const data      = result.value?.data?.purchases ?? result.value?.data ?? [];
        return Array.isArray(data) ? data.map(p => ({ ...p, accountId })) : [];
      });
      merged.sort((l, r) => new Date(r?.createdAt || r?.date || 0) - new Date(l?.createdAt || l?.date || 0));
      setPurchaseHistory(merged);
    } catch {
      setPurchaseHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);  

  useEffect(() => {
    if (!isClient) return;
    (async () => {
      try {
        const loadedAccounts = await getAccounts();
        const accountList    = Array.isArray(loadedAccounts) ? loadedAccounts : [];
        await fetchPurchaseHistory(accountList);
      } catch { /* silent */ }
    })();
  }, [isClient]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (!isAdmin) setStatusFilter('active'); }, [isAdmin]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const search = (searchTerm || '').toLowerCase().trim();
    let result   = products.slice();
    if (!isAdmin)                result = result.filter(p => p?.isActive);
    if (statusFilter === 'active')   result = result.filter(p =>  p?.isActive);
    if (statusFilter === 'inactive') result = result.filter(p => !p?.isActive);
    if (!search) return result;
    return result.filter(p =>
      (p?.name || '').toLowerCase().includes(search) ||
      (p?.description || '').toLowerCase().includes(search)
    );
  }, [products, searchTerm, statusFilter, isAdmin]);

  const totalPages        = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const handleChange    = (e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };
  const openCreateModal = ()  => { setEditingId(null); setForm({ name: '', description: '', price: '' }); setShowModal(true); };
  const openEditModal   = (product) => {
    setEditingId(product?._id || product?.id);
    setForm({ name: product?.name || '', description: product?.description || '', price: product?.price || '' });
    setShowModal(true);
  };
  const openPurchaseModal = (product) => {
    const defaultAccount = activeAccounts[0];
    setSelectedProduct(product);
    setSelectedAccountId(defaultAccount?._id || defaultAccount?.id || '');
    setPurchaseOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormLoading(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editingId) { await updateProduct(editingId, payload); showSuccess('Producto actualizado correctamente'); }
      else           { await createProduct(payload);             showSuccess('Producto creado correctamente');     }
      setForm({ name: '', description: '', price: '' }); setShowModal(false); setEditingId(null);
      fetchProducts();
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'Error al guardar producto');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!selectedProduct)   { showError('Selecciona un producto'); return; }
    if (!selectedAccountId) { showError('Selecciona una cuenta activa'); return; }
    setPurchaseLoading(true);
    try {
      const response = await purchaseProduct({ productId: selectedProduct._id || selectedProduct.id, accountId: selectedAccountId });
      if (response?.data?.success === false) { showError(response?.data?.message || 'No se pudo completar la compra'); return; }
      showSuccess('Producto comprado correctamente');
      setPurchaseOpen(false); setSelectedProduct(null);
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
    } catch {
      showError('Error al cambiar estado del producto');
    }
  };

  return {
    products, loading, showModal, setShowModal, searchTerm, setSearchTerm,
    statusFilter, setStatusFilter, currentPage, setCurrentPage,
    editingId, setEditingId, form, formLoading,
    purchaseOpen, setPurchaseOpen, selectedProduct, setSelectedProduct,
    selectedAccountId, setSelectedAccountId, purchaseLoading,
    purchaseHistory, historyLoading,
    activeAccounts, moneyFormatter, filteredProducts, totalPages, paginatedProducts,
    isAdmin, isClient,
    handleChange, openCreateModal, openEditModal, openPurchaseModal,
    handleSubmit, handlePurchase, handleToggleActive, fetchProducts,
  };
};
