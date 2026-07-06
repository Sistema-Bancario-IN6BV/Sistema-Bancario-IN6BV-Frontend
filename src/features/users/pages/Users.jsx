// Users.jsx — REDISEÑO VISUAL ÚNICAMENTE
// Toda la lógica, estados, handlers, hooks, filtros y paginación son idénticos al original
import { useEffect, useMemo, useState } from "react";
import { useUserManagmentStore } from "../store/useUserManagmentStore.js";
import { Spinner } from "../../../shared/components/layouts/Spinner.jsx";
import { showError, showSuccess } from "../../../shared/utils/toast.js";
import { CreateUserModal } from "../components/CreateUserModal.jsx";
import { useAuthStore } from "../../auth/store/authStore.js";
import { UserDetailModal } from "../components/UserDetailModel.jsx";
import { createUserByAdmin, updateUserByAdmin, deleteUserByAdmin } from "../../../shared/api/auth.js";
import { normalizeRole } from "../../../shared/utils/authRole.js";
import {
  UsersIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StatCard } from "../components/StatCard.jsx";
import { UserAvatar } from "../components/UserAvatar.jsx";
import { RolePill } from "../components/RolePill.jsx";
import { GLASS_PANEL } from "../../../shared/constants/glassStyles";

const PAGE_SIZE = 8;
const ROLE_OPTIONS = ["ADMIN_ROLE", "USER_ROLE"];

const glassPanel = GLASS_PANEL;

export const Users = () => {
  // ── Store y estado originales intactos ──
  const { users, loading, error, fetchUsers, updateUserRole } = useUserManagmentStore();
  const currentUser = useAuthStore((state) => state.user);

  const [search,          setSearch]          = useState("");
  const [roleFilter,      setRoleFilter]      = useState("ALL");
  const [page,            setPage]            = useState(1);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedUser,    setSelectedUser]    = useState(null);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { if (error) showError(error); }, [error]);

  // ── Filtrado y paginación originales intactos ──
  const filteredUsers = useMemo(() => {
    const norm = search.trim().toLowerCase();
    return users.filter((u) => {
      const fullName = `${u.name || ""} ${u.surname || ""}`.trim().toLowerCase();
      const username = (u.username || "").toLowerCase();
      const role     = normalizeRole(u.role) || (u.role || "").toUpperCase();
      const matchesSearch = !norm || fullName.includes(norm) || username.includes(norm);
      const matchesRole   = roleFilter === "ALL" ? true : role === roleFilter.toUpperCase();
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const totalPages     = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage    = Math.min(page, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  // ── Handlers originales intactos ──
  const handleCreate = async (formData) => {
    try {
      await createUserByAdmin(formData);
      showSuccess("Usuario creado correctamente");
      await fetchUsers(undefined, { force: true });
      return true;
    } catch (err) {
      showError(err?.response?.data?.message || err.message || "No se pudo crear el usuario");
      return false;
    }
  };

  const handleSaveRole = async (user, newRole) => {
    const res = await updateUserRole(user.id, newRole);
    if (res.success) {
      showSuccess("Rol actualizado correctamente");
      setOpenDetailModal(false);
      setSelectedUser(null);
    } else {
      showError(res.error || "No se pudo actualizar el rol");
    }
  };

  const handleSaveUser = async (user, form) => {
    const role = normalizeRole(user.role) || "USER_ROLE";
    if (role === "ADMIN_ROLE" && currentUser?.id !== user.id) {
      showError("No puedes editar otro administrador");
      return;
    }
    if (Number(form.monthlyIncome) < 100) {
      showError("Los ingresos mensuales deben ser al menos Q100");
      return;
    }
    const formData = new FormData();
    formData.append("name",          form.name || "");
    formData.append("surname",       form.surname || "");
    formData.append("email",         form.email || "");
    formData.append("phone",         form.phone || "");
    formData.append("address",       form.address || "");
    formData.append("jobName",       form.jobName || "");
    formData.append("monthlyIncome", String(form.monthlyIncome ?? ""));
    try {
      await updateUserByAdmin(user.id, formData);
      showSuccess("Usuario actualizado correctamente");
      await fetchUsers(undefined, { force: true });
      setOpenDetailModal(false);
      setSelectedUser(null);
    } catch (err) {
      showError(err?.response?.data?.message || err.message || "No se pudo actualizar el usuario");
    }
  };

  const handleDeleteUser = async (user) => {
    const role = normalizeRole(user.role) || "USER_ROLE";
    if (role === "ADMIN_ROLE") { showError("No puedes eliminar otro administrador"); return; }
    if (!window.confirm(`¿Eliminar al usuario ${[user.name, user.surname].filter(Boolean).join(" ") || user.username}?`)) return;
    try {
      await deleteUserByAdmin(user.id);
      showSuccess("Usuario eliminado correctamente");
      await fetchUsers(undefined, { force: true });
      setOpenDetailModal(false);
      setSelectedUser(null);
    } catch (err) {
      showError(err?.response?.data?.message || err.message || "No se pudo eliminar el usuario");
    }
  };

  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setOpenDetailModal(true);
  };

  const firstItem = (currentPage - 1) * PAGE_SIZE + (paginatedUsers.length ? 1 : 0);
  const lastItem  = (currentPage - 1) * PAGE_SIZE + paginatedUsers.length;

  // ── Derived stats para hero cards ──
  const totalUsers  = users.length;
  const adminCount  = users.filter(u => (normalizeRole(u.role) || u.role) === "ADMIN_ROLE").length;
  const clientCount = users.filter(u => (normalizeRole(u.role) || u.role) === "USER_ROLE").length;

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'clamp(16px, 3vw, 32px)',
      background: 'radial-gradient(ellipse 70% 50% at 10% 0%, rgba(79,142,247,0.07) 0%, transparent 55%), var(--dash-bg, #070d1a)',
    }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>

        {/* ══ Hero Header ══ */}
        <section style={{
          ...glassPanel,
          marginBottom: '24px',
          padding: 'clamp(24px,4vw,40px)',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(10,37,64,0.92) 0%, rgba(26,75,140,0.72) 55%, rgba(79,142,247,0.14) 100%)',
          border: '1px solid rgba(79,142,247,0.2)',
        }}>
          {/* Mesh gradients */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            background: 'radial-gradient(ellipse 55% 70% at 90% 10%, rgba(79,142,247,0.18) 0%, transparent 55%), radial-gradient(ellipse 40% 50% at 10% 90%, rgba(0,212,160,0.10) 0%, transparent 50%)',
          }} />
          {/* Grid texture */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(79,142,247,0.85)', marginBottom: '10px' }}>
                Gestión de Usuarios
              </p>
              <h1 style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: 'clamp(1.8rem,4vw,2.8rem)',
                fontWeight: 400, color: '#e8f0fe',
                letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '10px',
              }}>
                Usuarios del Sistema
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(232,240,254,0.5)', maxWidth: '480px', lineHeight: 1.7 }}>
                Administra cuentas de usuario, gestiona roles y controla el acceso al sistema bancario.
              </p>
            </div>
            {/* ── Botón Agregar — onClick original intacto ── */}
            <button
              onClick={() => setOpenCreateModal(true)}
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
              <PlusIcon style={{ width: '15px', height: '15px' }} /> Agregar usuario
            </button>
          </div>
        </section>

        {/* ══ Stat Cards ══ */}
        <section style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', marginBottom: '24px' }}>
          <StatCard label="Total Usuarios"  value={totalUsers}  icon={UsersIcon}       grad="linear-gradient(135deg,#4f8ef7,#2563eb)" glow="rgba(79,142,247,0.35)" />
          <StatCard label="Administradores" value={adminCount}  icon={ShieldCheckIcon} grad="linear-gradient(135deg,#a78bfa,#7c3aed)" glow="rgba(167,139,250,0.35)" />
          <StatCard label="Clientes"        value={clientCount} icon={UserGroupIcon}   grad="linear-gradient(135deg,#00d4a0,#059669)" glow="rgba(0,212,160,0.35)" />
          <StatCard label="Filtrados"       value={filteredUsers.length} icon={ClockIcon} grad="linear-gradient(135deg,#fbbf24,#d97706)" glow="rgba(251,191,36,0.3)" />
        </section>

        {/* ══ Barra de filtros ══ */}
        <section style={{ ...glassPanel, padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr 220px' }}>
            {/* Búsqueda — value, onChange originales intactos */}
            <div style={{ gridColumn: 'span 2', position: 'relative' }}>
              <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(232,240,254,0.35)', pointerEvents: 'none' }}>
                <MagnifyingGlassIcon style={{ width: '15px', height: '15px' }} />
              </span>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar por nombre o usuario..."
                style={{
                  width: '100%', padding: '10px 14px 10px 38px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-body, inherit)',
                  fontSize: '0.875rem', color: '#e8f0fe',
                  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(79,142,247,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            {/* Filtro rol — value, onChange originales intactos */}
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              style={{
                width: '100%', padding: '10px 32px 10px 13px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                fontFamily: 'var(--font-body, inherit)',
                fontSize: '0.875rem', color: '#e8f0fe',
                outline: 'none', cursor: 'pointer',
                appearance: 'none',
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(232,240,254,0.4)' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}
            >
              <option value="ALL"      style={{ background: '#0a2540' }}>Todos los roles</option>
              {ROLE_OPTIONS.map((r) => <option key={r} value={r} style={{ background: '#0a2540' }}>{r}</option>)}
            </select>
          </div>
        </section>

        {/* ══ Tabla de usuarios ══ */}
        <section style={{ ...glassPanel }}>

          {/* Cabecera de la tabla */}
          <div style={{ padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Usuario', 'Username', 'Rol', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '14px 0',
                      textAlign: i === 3 ? 'right' : 'left',
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
            <table style={{ width: '100%', borderCollapse: 'collapse', padding: '0 24px', display: 'table' }}>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'rgba(232,240,254,0.4)', fontSize: '0.875rem' }}>
                        <span style={{
                          width: '20px', height: '20px', border: '2px solid rgba(79,142,247,0.25)',
                          borderTopColor: '#4f8ef7', borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite', display: 'inline-block',
                        }} />
                        Cargando usuarios...
                      </div>
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <UsersIcon style={{ width: '36px', height: '36px', color: 'rgba(232,240,254,0.15)', margin: '0 auto 12px', display: 'block' }} />
                      <p style={{ color: 'rgba(232,240,254,0.35)', fontSize: '0.875rem' }}>No hay usuarios para mostrar.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u, idx) => (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: idx < paginatedUsers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Usuario */}
                      <td style={{ padding: '15px 24px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <UserAvatar name={u.name} surname={u.surname} />
                          <span style={{ fontWeight: 500, color: '#e8f0fe', fontSize: '0.875rem' }}>
                            {[u.name, u.surname].filter(Boolean).join(" ") || "—"}
                          </span>
                        </div>
                      </td>
                      {/* Username */}
                      <td style={{ padding: '15px 24px', verticalAlign: 'middle', color: 'rgba(232,240,254,0.45)', fontSize: '0.875rem' }}>
                        @{u.username}
                      </td>
                      {/* Rol */}
                      <td style={{ padding: '15px 24px', verticalAlign: 'middle' }}>
                        <RolePill role={u.role} />
                      </td>
                      {/* Acciones — onClick original intacto */}
                      <td style={{ padding: '15px 24px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenDetail(u)}
                          style={{
                            padding: '7px 16px', borderRadius: '9px',
                            background: 'rgba(79,142,247,0.12)',
                            border: '1px solid rgba(79,142,247,0.3)',
                            color: '#a5c8ff', fontSize: '0.78rem', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.15s ease',
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.22)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
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

          {/* ══ Paginación — handlers originales intactos ══ */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 24px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            flexWrap: 'wrap', gap: '10px',
          }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(232,240,254,0.35)' }}>
              {filteredUsers.length === 0
                ? 'Sin resultados'
                : `Mostrando ${firstItem}–${lastItem} de ${filteredUsers.length}`}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '7px 13px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(232,240,254,0.6)', fontSize: '0.78rem', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  opacity: currentPage === 1 ? 0.35 : 1,
                }}
                onMouseEnter={e => { if (currentPage !== 1) e.currentTarget.style.background = 'rgba(79,142,247,0.12)'; }}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <ChevronLeftIcon style={{ width: '14px', height: '14px' }} /> Anterior
              </button>
              <span style={{
                padding: '7px 12px', fontSize: '0.78rem', fontWeight: 600,
                color: 'rgba(232,240,254,0.6)',
              }}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '7px 13px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(232,240,254,0.6)', fontSize: '0.78rem', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  opacity: currentPage === totalPages ? 0.35 : 1,
                }}
                onMouseEnter={e => { if (currentPage !== totalPages) e.currentTarget.style.background = 'rgba(79,142,247,0.12)'; }}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                Siguiente <ChevronRightIcon style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* ══ Modales — props originales 100% intactos ══ */}
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
        onSaveUser={handleSaveUser}
        onDeleteUser={handleDeleteUser}
        currentUserId={currentUser?.id}
        loading={loading}
      />
    </div>
  );
};