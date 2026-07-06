import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  activateProduct, deactivateProduct,
} from '../../../shared/api/products';
import { normalizeRole } from '../../../shared/utils/authRole';
import { useAuthStore } from '../../auth/store/authStore';
import { showError, showSuccess } from '../../../shared/utils/toast';

export const useServices = () => {
  const { user } = useAuthStore();
  const role     = normalizeRole(user?.role);
  const isAdmin  = role === 'ADMIN_ROLE';

  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({ name: '', price: 0, description: '', isActive: true });

  const moneyFormatter = useMemo(
    () => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2 }),
    []
  );

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await getProducts();
      const data = res?.data?.products ?? res?.data ?? [];
      const list = Array.isArray(data)
        ? data.filter(p => String(p?.type || '').toLowerCase() === 'service' || String(p?.category || '').toLowerCase() === 'service')
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
      if (editing) { await updateProduct(editing, payload); showSuccess('Servicio actualizado'); }
      else         { await createProduct(payload);          showSuccess('Servicio creado');      }
      fetchServices();
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'Error al guardar servicio');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar servicio?')) return;
    try {
      await deleteProduct(id); showSuccess('Servicio eliminado'); fetchServices();
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

  const activeCount   = services.filter(s => String(s?.isActive) !== 'false' && !!s?.isActive).length;
  const inactiveCount = services.length - activeCount;
  const avgPrice      = services.length > 0
    ? services.reduce((sum, s) => sum + Number(s?.price || 0), 0) / services.length
    : 0;

  return {
    services, loading, editing, form, setForm,
    moneyFormatter, isAdmin, activeCount, inactiveCount, avgPrice,
    fetchServices, openCreate, openEdit, handleSave, handleDelete, toggleActive,
  };
};
