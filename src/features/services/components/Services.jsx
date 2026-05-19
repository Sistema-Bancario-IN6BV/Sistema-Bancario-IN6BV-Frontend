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
} from '@heroicons/react/24/outline';

export const Services = () => {
  const { user } = useAuthStore();
  const role = normalizeRole(user?.role);
  const isAdmin = role === 'ADMIN_ROLE';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: 0, description: '', isActive: true });

  const moneyFormatter = useMemo(
    () => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2 }),
    []
  );

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts();
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

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm({ name: '', price: 0, description: '', isActive: true });
  }, []);

  const openEdit = useCallback((service) => {
    setEditing(service?._id || service?.id);
    setForm({
      name: service?.name || '',
      price: Number(service?.price || 0),
      description: service?.description || '',
      isActive: String(service?.isActive) === 'false' ? false : !!service?.isActive,
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

  if (!isAdmin) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Servicios</h1>
            <p className="page-subtitle">No tienes permisos para administrar servicios.</p>
          </div>
        </div>

        <div className="panel">
          <div className="panel-body">
            <div className="text-sm text-slate-600">
              Esta sección es exclusiva para <strong>ADMIN_ROLE</strong>.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Servicios</h1>
          <p className="page-subtitle">Administra servicios (crear, editar, activar o desactivar).</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={openCreate}>Nuevo</button>
          <button className="btn-primary" onClick={handleSave}>{editing ? 'Actualizar' : 'Crear'}</button>
        </div>
      </div>

      <div className="panel mb-4">
        <div className="panel-body">
          <div className="filter-bar cols-3" style={{ marginBottom: 0 }}>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <div className="field-label">Nombre</div>
              <input
                className="field-input"
                placeholder="Ej. Pago de luz"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="field-group" style={{ marginBottom: 0 }}>
              <div className="field-label">Precio</div>
              <input
                className="field-input"
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>

            <div className="field-group" style={{ marginBottom: 0 }}>
              <div className="field-label">Estado</div>
              <select
                className="filter-select"
                value={form.isActive ? '1' : '0'}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === '1' })}
              >
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </div>

            <div className="field-group span-2" style={{ marginBottom: 0 }}>
              <div className="field-label">Descripción</div>
              <textarea
                className="field-input"
                placeholder="Describe el servicio..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="field-group" style={{ marginBottom: 0 }}>
              <div className="field-label">Acción</div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={openCreate} type="button">Limpiar</button>
                <button className="btn-primary" onClick={handleSave} type="button">{editing ? 'Actualizar' : 'Crear'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th className="right">Precio</th>
                <th>Estado</th>
                <th className="right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="data-table-empty">Cargando servicios...</td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={4} className="data-table-empty">No hay servicios registrados.</td>
                </tr>
              ) : (
                services.map((service) => {
                  const id = service?._id || service?.id;
                  const active = String(service?.isActive) === 'false' ? false : !!service?.isActive;
                  return (
                    <tr key={id}>
                      <td>
                        <div className="font-medium">{service?.name}</div>
                        <div className="text-sm text-slate-500">{service?.description || '—'}</div>
                      </td>
                      <td className="right">{moneyFormatter.format(Number(service?.price || 0))}</td>
                      <td>
                        <span className={`badge ${active ? 'badge-success' : 'badge-neutral'}`}>
                          {active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="right">
                        <div className="inline-flex items-center gap-2">
                          <button className="btn-icon" onClick={() => openEdit(service)} title="Editar" aria-label="Editar">
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button className="btn-icon danger" onClick={() => handleDelete(id)} title="Eliminar" aria-label="Eliminar">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => toggleActive(id, active)}
                            title={active ? 'Desactivar' : 'Activar'}
                            aria-label={active ? 'Desactivar' : 'Activar'}
                          >
                            {active ? <NoSymbolIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
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
      </div>
    </div>
  );
};

export default Services;
