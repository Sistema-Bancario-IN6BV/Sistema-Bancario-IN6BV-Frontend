// Users.jsx — REDISEÑO VISUAL · Lógica intacta
import { useEffect, useMemo, useState } from "react";
import { useUserManagmentStore } from "../store/useUserManagmentStore.js";
import { Spinner } from "../../../shared/components/layouts/Spinner.jsx";
import { showError, showSuccess } from "../../../shared/utils/toast.js";
import { CreateUserModal } from "./CreateUserModal.jsx";
import { useAuthStore } from "../../auth/store/authStore.js";
import { UserDetailModal } from "./UserDetailModel.jsx";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

const PAGE_SIZE = 8;
const ROLE_OPTIONS = ["ADMIN_ROLE", "USER_ROLE"];

/* — Badge por rol — */
const roleBadge = {
    PLATFORM_ADMIN:   "badge badge-primary",
    RESTAURANT_ADMIN: "badge badge-warning",
    CUSTOMER:         "badge badge-success",
};

const IconSearch = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
);

const IconPlus = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M5 12h14M12 5v14"/>
    </svg>
);

const IconChevronLeft  = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
);
const IconChevronRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
);

/* Iniciales del avatar */
const Initials = ({ name, surname }) => {
    const letters = [name?.[0], surname?.[0]].filter(Boolean).join('').toUpperCase() || '?';
    return (
        <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(46,111,212,0.12)',
            border: '1px solid rgba(46,111,212,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)',
            flexShrink: 0,
        }}>
            {letters}
        </div>
    );
};

export const Users = () => {
    /* — Store y estado originales intactos — */
    const { users, loading, error, fetchUsers, updateUserRole } = useUserManagmentStore();
    const registerUser = useAuthStore((state) => state.register)
    const currentUser = useAuthStore((state) => state.user)

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openDetailModal, setOpenDetailModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    useEffect(() => { if (error) showError(error); }, [error]);

    /* — Filtrado y paginación originales intactos — */
    const filteredUsers = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        return users.filter((u) => {
            const fullName = `${u.name || ""} ${u.surname || ""}`
                .trim()
                .toLowerCase();

            const username = (u.username || "").toLowerCase();
            const role = (u.role || "").toUpperCase();

            const matchesSearch =
                !normalizedSearch ||
                fullName.includes(normalizedSearch) ||
                username.includes(normalizedSearch);

            const matchesRole =
                roleFilter === "ALL" ? true : role === roleFilter.toUpperCase();

            return matchesRole && matchesSearch;
        })
    }, [users, search, roleFilter])

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredUsers.slice(start, start + PAGE_SIZE);
    }, [filteredUsers, currentPage])

    /* — Handlers originales intactos — */
    const handleCreate = async (formData) => {
        const res = await registerUser(formData)
        console.log(res)
        if (res.success) {
            showSuccess("Usuairo creado. Se envió un correo de verificación.");
            await fetchUsers(undefined, { force: true });
            return true;
        }
        showError(res.error || "No se puedo crear el usuario");
        return false;
    }

    const handleSaveRole = async (user, newRole) => {
        const res = await updateUserRole(user.id, newRole);
        if (res.success) {
            showSuccess("Rol actualizado correctamente")
            setOpenDetailModal(false);
            setSelectedUser(null);
        } else {
            showError(res.error || "No se pudo actualizar el rol");
        }
    }

    const handleOpenDetail = (user) => {
        setSelectedUser(user)
        setOpenDetailModal(true);
    };

    const firstItem = (currentPage - 1) * PAGE_SIZE + (paginatedUsers.length ? 1 : 0);
    const lastItem  = (currentPage - 1) * PAGE_SIZE + paginatedUsers.length;

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="page-header-text">
                    <h1 className="page-title">Usuarios</h1>
                    <p className="page-subtitle">Administra usuarios y gestiona sus roles</p>
                </div>
                <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '9px 18px' }}
                    onClick={() => setOpenCreateModal(true)}
                >
                    <IconPlus /> Agregar usuario
                </button>
            </div>

            {/* Filtros */}
            <div className="filter-bar cols-3">
                <div className="search-wrap span-2">
                    <IconSearch />
                    <input
                        className="search-input"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Buscar por nombre o usuario..."
                    />
                </div>
                <select
                    className="filter-select"
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                >
                    <option value="ALL">Todos los roles</option>
                    {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            {/* Tabla */}
            <div className="panel">
                <div className="data-table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Username</th>
                                <th>Rol</th>
                                <th className="right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="data-table-empty">
                                        <div className="loading-state" style={{ padding: '24px' }}>
                                            <span className="spinner-blue" /> Cargando...
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="data-table-empty">
                                        No hay usuarios para mostrar.
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((u) => (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <Initials name={u.name} surname={u.surname} />
                                                <span style={{ fontWeight: 500 }}>
                                                    {[u.name, u.surname].filter(Boolean).join(" ") || "—"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="muted">@{u.username}</td>
                                        <td>
                                            <span className={roleBadge[u.role] || "badge badge-neutral"}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="right">
                                            <button
                                                className="btn-secondary"
                                                style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                                                onClick={() => handleOpenDetail(u)}
                                            >
                                                Ver / Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="pagination">
                    <span>
                        {filteredUsers.length === 0
                            ? 'Sin resultados'
                            : `Mostrando ${firstItem}–${lastItem} de ${filteredUsers.length}`}
                    </span>
                    <div className="pagination-controls">
                        <button
                            className="btn-page"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <IconChevronLeft /> Anterior
                        </button>
                        <span className="page-indicator">{currentPage} / {totalPages}</span>
                        <button
                            className="btn-page"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente <IconChevronRight />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modales — props originales intactos */}
            <CreateUserModal
                isOpen={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onCreate={handleCreate}
                loading={loading}
                error={error}
            />

            <UserDetailModal
                key={selectedUser?.id || "no-user"}
                isOpen={openDetailModal}
                onClose={() => { setOpenDetailModal(false); setSelectedUser(null); }}
                user={selectedUser}
                onSaveRole={handleSaveRole}
                currentUserId={currentUser?.id}
                loading={loading}
            />
        </div>
    );
};