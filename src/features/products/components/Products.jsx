import React, { useState, useEffect, useMemo } from 'react';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  activateProduct,
  deactivateProduct 
} from '../../../shared/api/products';
import { showSuccess, showError } from '../../../shared/utils/toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  TagIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  PencilIcon,

  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  CheckIcon
} from "@heroicons/react/24/outline";

export const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', price: '' });
    const [formLoading, setFormLoading] = useState(false);
    const itemsPerPage = 10;

    // Fetch products on mount
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await getProducts();
            console.log('Raw API Response:', response);
            
            // El backend devuelve { success, total, products: [...] }
            let productsData = response.data?.products || response.data?.data || response.data || [];
            console.log('Products Data after extraction:', productsData);
            
            // Si es un objeto con propiedades pero no un array, convertirlo
            if (productsData && !Array.isArray(productsData) && typeof productsData === 'object') {
                productsData = Object.values(productsData);
            }
            
            const finalProducts = Array.isArray(productsData) ? productsData : [];
            // Normalize isActive to boolean in case backend returns strings/numbers
            const normalized = finalProducts.map(p => {
                const raw = p?.isActive;
                let isActiveBool = false;
                if (typeof raw === 'boolean') isActiveBool = raw;
                else if (typeof raw === 'string') isActiveBool = raw === 'true' || raw === '1';
                else if (typeof raw === 'number') isActiveBool = raw === 1;
                else isActiveBool = !!raw;

                return { ...p, isActive: isActiveBool };
            });
            console.log('Final Products:', normalized);

            setProducts(normalized);
        } catch (err) {
            showError('Error al cargar productos');
            console.error('Error fetching products:', err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter and paginate (supports statusFilter: 'all' | 'active' | 'inactive')
    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];
        const search = (searchTerm || '').toLowerCase().trim();

        // start from all products, then apply status filter
        let result = products.slice();

        if (statusFilter === 'active') {
            result = result.filter(p => p?.isActive);
        } else if (statusFilter === 'inactive') {
            result = result.filter(p => !p?.isActive);
        }

        if (!search) return result;

        return result.filter(p => {
            const name = (p?.name || '').toLowerCase();
            const description = (p?.description || '').toLowerCase();
            return name.includes(search) || description.includes(search);
        });
    }, [products, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage]);

    // Reset to page 1 when search or status filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const openCreateModal = () => {
        setEditingId(null);
        setForm({ name: '', description: '', price: '' });
        setShowModal(true);
    };

    const openEditModal = (product) => {
        const productId = product?._id || product?.id;
        setEditingId(productId);
        setForm({
            name: product?.name || '',
            description: product?.description || '',
            price: product?.price || ''
        });
        console.log('Opening edit modal for product:', product);
        setShowModal(true);
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



    const handleToggleActive = async (productId, isCurrentlyActive) => {
        try {
            if (isCurrentlyActive) {
                await deactivateProduct(productId);
                showSuccess('Producto desactivado');
            } else {
                await activateProduct(productId);
                showSuccess('Producto activado');
            }
            fetchProducts();
        } catch (err) {
            showError('Error al cambiar estado del producto');
        }
    };


    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(46,111,212,0.10),_transparent_28%),linear-gradient(180deg,_#f4f8fc_0%,_#edf3f9_100%)] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1440px] space-y-6">
                {/* Hero Section */}
                <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_#0a2540_0%,_#123b67_55%,_#1a4b8c_100%)] px-6 py-6 text-white shadow-[0_20px_60px_rgba(10,37,64,0.22)] sm:px-8 sm:py-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(90,156,245,0.28),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(0,196,140,0.16),_transparent_25%)]" />
                    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur">
                                <TagIcon className="h-4 w-4" />
                                Catálogo Financiero
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                    Productos Bancarios
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
                                    Gestión de carteras, préstamos y cuentas especiales. Define la oferta comercial del banco.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 xl:justify-end">
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center gap-2 rounded-full bg-[#0f7bdf] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0f7bdf]/30 transition hover:-translate-y-0.5 hover:bg-[#0c67bc]"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Crear Producto
                            </button>
                        </div>
                    </div>
                </section>

                {/* Stats Row */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: "Total de Productos", value: products.length, icon: BuildingStorefrontIcon, tone: "from-blue-600 to-slate-900" },
                        { label: "Precio Promedio", value: products.length > 0 ? `Q ${(products.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / products.length).toFixed(2)}` : "Q 0", icon: CurrencyDollarIcon, tone: "from-emerald-500 to-teal-700" },
                        { label: "Activos", value: products.filter(p => p.isActive).length, icon: ShieldCheckIcon, tone: "from-indigo-500 to-blue-800" },
                        { label: "Inactivos", value: products.filter(p => !p.isActive).length, icon: TagIcon, tone: "from-amber-500 to-orange-700" },
                    ].map(({ label, value, icon: Icon, tone }) => (
                        <article key={label} className="group relative overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_10px_30px_rgba(10,37,64,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(10,37,64,0.12)]">
                            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone}`} />
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
                                    <p className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">{value}</p>
                                </div>
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                {/* Debug panel removed */}

                {/* Search Section */}
                <section className="rounded-[1.5rem] border border-white/70 bg-white/88 p-4 shadow-[0_18px_50px_rgba(10,37,64,0.08)] backdrop-blur sm:p-6">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        />
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                        <span className="text-sm text-slate-600">Mostrar:</span>
                        <div className="inline-flex rounded-md overflow-hidden border border-slate-200">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1 text-sm ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                            >
                                Todos
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('active')}
                                className={`px-3 py-1 text-sm ${statusFilter === 'active' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                            >
                                Activos
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('inactive')}
                                className={`px-3 py-1 text-sm ${statusFilter === 'inactive' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                            >
                                Inactivos
                            </button>
                        </div>
                    </div>
                </section>

                {/* Products Table */}
                <section className="rounded-[1.5rem] border border-white/70 bg-white/88 shadow-[0_18px_50px_rgba(10,37,64,0.08)] backdrop-blur overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="mb-4 inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="text-slate-600">Cargando productos...</p>
                            </div>
                        </div>
                    ) : paginatedProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <BuildingStorefrontIcon className="h-12 w-12 mb-4 text-slate-300" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                {searchTerm ? 'No se encontraron productos' : 'Sin productos'}
                            </h3>
                            <p className="text-slate-500 text-sm">
                                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer producto para comenzar'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Nombre</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Descripción</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Precio</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">Estado</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {paginatedProducts.map((product, idx) => {
                                            const productId = product?._id || product?.id || `product-${idx}`;
                                            return (
                                            <tr key={productId} className="transition hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{product?.name || 'Sin nombre'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                                                    {product?.description || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-right text-slate-900">
                                                    Q {(Number(product?.price) || 0).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleToggleActive(productId, product?.isActive)}
                                                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                                                            product?.isActive
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {product?.isActive ? (
                                                            <>
                                                                <CheckIcon className="h-4 w-4" />
                                                                Activo
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XMarkIcon className="h-4 w-4" />
                                                                Inactivo
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => openEditModal(product)}
                                                            className="rounded-lg p-2 text-slate-600 transition hover:bg-blue-100 hover:text-blue-600"
                                                            title="Editar"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                                    <div className="text-sm text-slate-600">
                                        Página <span className="font-semibold">{currentPage}</span> de{' '}
                                        <span className="font-semibold">{totalPages}</span> (Total:{' '}
                                        <span className="font-semibold">{filteredProducts.length}</span>)
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                        >
                                            <ChevronLeftIcon className="h-4 w-4" />
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                        >
                                            Siguiente
                                            <ChevronRightIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                        <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                            <h3 className="mb-4 text-xl font-semibold text-slate-900">
                                {editingId ? 'Editar Producto' : 'Crear Producto'}
                            </h3>
                            
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-slate-700">Nombre *</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    maxLength={150}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                                    placeholder="Nombre del producto"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-slate-700">Descripción</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    maxLength={500}
                                    rows={4}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                                    placeholder="Descripción del producto"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-slate-700">Precio *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-2.5 text-slate-500">$</span>
                                    <input
                                        name="price"
                                        value={form.price}
                                        onChange={handleChange}
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingId(null);
                                    }}
                                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                                >
                                    {formLoading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}


            </div>
        </div>
    );
};
