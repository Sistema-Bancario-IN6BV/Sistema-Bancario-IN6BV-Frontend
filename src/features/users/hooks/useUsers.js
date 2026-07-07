import { useEffect, useMemo, useState } from 'react';
import { useUserManagmentStore } from '../store/useUserManagmentStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { showError, showSuccess } from '../../../shared/utils/toast.js';
import { createUserByAdmin, updateUserByAdmin, deleteUserByAdmin } from '../../../shared/api/auth.js';
import { normalizeRole } from '../../../shared/utils/authRole.js';

const PAGE_SIZE = 8;

export const useUsers = () => {
  const { users, loading, error, fetchUsers, updateUserRole } = useUserManagmentStore();
  const currentUser = useAuthStore(state => state.user);

  const [search,          setSearch]          = useState('');
  const [roleFilter,      setRoleFilter]      = useState('ALL');
  const [page,            setPage]            = useState(1);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedUser,    setSelectedUser]    = useState(null);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { if (error) showError(error); }, [error]);

  const filteredUsers = useMemo(() => {
    const norm = search.trim().toLowerCase();
    return users.filter(u => {
      const fullName     = `${u.name || ''} ${u.surname || ''}`.trim().toLowerCase();
      const username     = (u.username || '').toLowerCase();
      const role         = normalizeRole(u.role) || (u.role || '').toUpperCase();
      const matchesSearch = !norm || fullName.includes(norm) || username.includes(norm);
      const matchesRole   = roleFilter === 'ALL' ? true : role === roleFilter.toUpperCase();
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const totalPages     = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage    = Math.min(page, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const firstItem = (currentPage - 1) * PAGE_SIZE + (paginatedUsers.length ? 1 : 0);
  const lastItem  = (currentPage - 1) * PAGE_SIZE + paginatedUsers.length;

  const totalUsers  = users.length;
  const adminCount  = users.filter(u => (normalizeRole(u.role) || u.role) === 'ADMIN_ROLE').length;
  const clientCount = users.filter(u => (normalizeRole(u.role) || u.role) === 'USER_ROLE').length;

  const handleCreate = async (formData) => {
    try {
      await createUserByAdmin(formData);
      showSuccess('Usuario creado correctamente');
      await fetchUsers(undefined, { force: true });
      return true;
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'No se pudo crear el usuario');
      return false;
    }
  };

  const handleSaveRole = async (user, newRole) => {
    const res = await updateUserRole(user.id, newRole);
    if (res.success) {
      showSuccess('Rol actualizado correctamente');
      setOpenDetailModal(false); setSelectedUser(null);
    } else {
      showError(res.error || 'No se pudo actualizar el rol');
    }
  };

  const handleSaveUser = async (user, form) => {
    const role = normalizeRole(user.role) || 'USER_ROLE';
    if (role === 'ADMIN_ROLE' && currentUser?.id !== user.id) { showError('No puedes editar otro administrador'); return; }
    if (Number(form.monthlyIncome) < 100) { showError('Los ingresos mensuales deben ser al menos Q100'); return; }
    const formData = new FormData();
    formData.append('name',          form.name || '');
    formData.append('surname',       form.surname || '');
    formData.append('email',         form.email || '');
    formData.append('phone',         form.phone || '');
    formData.append('address',       form.address || '');
    formData.append('jobName',       form.jobName || '');
    formData.append('monthlyIncome', String(form.monthlyIncome ?? ''));
    try {
      await updateUserByAdmin(user.id, formData);
      showSuccess('Usuario actualizado correctamente');
      await fetchUsers(undefined, { force: true });
      setOpenDetailModal(false); setSelectedUser(null);
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'No se pudo actualizar el usuario');
    }
  };

  const handleDeleteUser = async (user) => {
    const role = normalizeRole(user.role) || 'USER_ROLE';
    if (role === 'ADMIN_ROLE') { showError('No puedes eliminar otro administrador'); return; }
    if (!window.confirm(`¿Eliminar al usuario ${[user.name, user.surname].filter(Boolean).join(' ') || user.username}?`)) return;
    try {
      await deleteUserByAdmin(user.id);
      showSuccess('Usuario eliminado correctamente');
      await fetchUsers(undefined, { force: true });
      setOpenDetailModal(false); setSelectedUser(null);
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'No se pudo eliminar el usuario');
    }
  };

  const handleOpenDetail = (user) => { setSelectedUser(user); setOpenDetailModal(true); };

  return {
    users, loading, error, currentUser,
    search, setSearch, roleFilter, setRoleFilter, page, setPage,
    openCreateModal, setOpenCreateModal, openDetailModal, setOpenDetailModal, selectedUser,
    filteredUsers, totalPages, currentPage, paginatedUsers, firstItem, lastItem,
    totalUsers, adminCount, clientCount,
    handleCreate, handleSaveRole, handleSaveUser, handleDeleteUser, handleOpenDetail,
  };
};
