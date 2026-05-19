// UserDetailModal.jsx — REDISEÑO VISUAL · Lógica extendida para edición y borrado
import { useEffect, useState } from "react";
import { Spinner } from "../../../shared/components/layouts/Spinner";
import defaultAvatarImg from "../../../assets/img/hero.png";
import { normalizeRole } from "../../../shared/utils/authRole";

const IconX = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
);

const IconAlertCircle = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
    </svg>
);

export const UserDetailModal = ({
    isOpen, onClose, user, currentUserId, onSaveRole, onSaveUser, onDeleteUser, loading,
}) => {
    const normalizedRole = normalizeRole(user?.role) || "USER_ROLE";
    const [role, setRole] = useState(normalizedRole);
    const [form, setForm] = useState({
        name: user?.name || "",
        surname: user?.surname || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        jobName: user?.jobName || "",
        monthlyIncome: user?.monthlyIncome || "",
    });

    useEffect(() => {
        if (!isOpen || !user) return;

        setRole(normalizeRole(user?.role) || "USER_ROLE");
        setForm({
            name: user?.name || "",
            surname: user?.surname || "",
            email: user?.email || "",
            phone: user?.phone || "",
            address: user?.address || "",
            jobName: user?.jobName || "",
            monthlyIncome: user?.monthlyIncome || "",
        });
    }, [user, isOpen]);

    if (!isOpen || !user) return null;

    const avatarSrc = (() => {
        const value = user?.profilePicture?.trim();
        if (!value) return defaultAvatarImg;
        if (value.startsWith("http://") || value.startsWith("https://")) return value;
        const base = import.meta.env.VITE_CLOUDINARY_BASE_URL || "https://res.cloudinary.com/db5rnorf/image/upload/";
        return `${base}${value.replace(/^\/+/, "")}`;
    })();

    const isCurrentUser = currentUserId === user.id;
    const isOtherAdmin = normalizedRole === "ADMIN_ROLE" && !isCurrentUser;
    const hasChanges    = role !== user.role;
    const hasProfileChanges =
        form.name !== (user?.name || "") ||
        form.surname !== (user?.surname || "") ||
        form.email !== (user?.email || "") ||
        form.phone !== (user?.phone || "") ||
        form.address !== (user?.address || "") ||
        form.jobName !== (user?.jobName || "") ||
        String(form.monthlyIncome ?? "") !== String(user?.monthlyIncome ?? "");

    const handleSave = async () => {
        if (!hasChanges || isCurrentUser) { onClose(); return; }
        await onSaveRole(user, role);
    };

    const handleDelete = async () => {
        if (isCurrentUser || isOtherAdmin) {
            return;
        }

        await onDeleteUser?.(user);
    };

    const roleBadge = {
        ADMIN_ROLE:   "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold bg-blue-600 text-white border border-blue-700/20",
        USER_ROLE:    "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold bg-emerald-600 text-white border border-emerald-700/20",
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                {/* Header */}
                <div className="modal-header-accent">
                    <div className="modal-header-info">
                        <h2 className="modal-title on-dark">Detalle de Usuario</h2>
                        <p className="modal-subtitle on-dark">Consulta información y gestiona el rol</p>
                    </div>
                    <button className="modal-close on-dark" type="button" onClick={onClose} aria-label="Cerrar">
                        <IconX />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">

                    {/* Perfil */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                        <img
                            src={avatarSrc}
                            alt={user.username}
                            className="user-avatar-lg"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultAvatarImg; }}
                        />
                        <div>
                            <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-main)', marginBottom: 2 }}>
                                {[user.name, user.surname].filter(Boolean).join(" ") || "—"}
                            </p>
                            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                                @{user.username}
                            </p>
                            <div style={{ marginTop: 6 }}>
                                <span className={roleBadge[user.role] || "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold bg-slate-200 text-slate-800 border border-slate-300"}>
                                    {user.role ? user.role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()) : "—"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className="modal-grid-2" style={{ marginBottom: 16 }}>
                        <div className="info-row">
                            <p className="info-row-label">ID</p>
                            <p className="info-row-value" style={{ fontSize: '0.75rem' }}>{user.id}</p>
                        </div>
                        <div className="info-row">
                            <p className="info-row-label">Email</p>
                            <p className="info-row-value">{user.email}</p>
                        </div>
                        <div className="info-row">
                            <p className="info-row-label">Nombre</p>
                            <p className="info-row-value">{user.name || "—"}</p>
                        </div>
                        <div className="info-row">
                            <p className="info-row-label">Apellido</p>
                            <p className="info-row-value">{user.surname || "—"}</p>
                        </div>
                    </div>

                    {/* Campos editables */}
                    <div className="modal-grid-2" style={{ marginBottom: 16 }}>
                        <div className="modal-field">
                            <label className="modal-label">Nombre</label>
                            <input className="modal-input" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} readOnly={isOtherAdmin} />
                        </div>
                        <div className="modal-field">
                            <label className="modal-label">Apellido</label>
                            <input className="modal-input" value={form.surname} onChange={(e) => setForm((prev) => ({ ...prev, surname: e.target.value }))} readOnly={isOtherAdmin} />
                        </div>
                        <div className="modal-field">
                            <label className="modal-label">Email</label>
                            <input className="modal-input" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} readOnly={isOtherAdmin} />
                        </div>
                        <div className="modal-field">
                            <label className="modal-label">Teléfono</label>
                            <input className="modal-input" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} readOnly={isOtherAdmin} />
                        </div>
                        <div className="modal-field">
                            <label className="modal-label">Dirección</label>
                            <input className="modal-input" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} readOnly={isOtherAdmin} />
                        </div>
                        <div className="modal-field">
                            <label className="modal-label">Trabajo / Puesto</label>
                            <input className="modal-input" value={form.jobName} onChange={(e) => setForm((prev) => ({ ...prev, jobName: e.target.value }))} readOnly={isOtherAdmin} />
                        </div>
                        <div className="modal-field">
                            <label className="modal-label">Ingresos mensuales</label>
                            <input className="modal-input" type="number" min="100" value={form.monthlyIncome} onChange={(e) => setForm((prev) => ({ ...prev, monthlyIncome: e.target.value }))} readOnly={isOtherAdmin} />
                        </div>
                    </div>

                    {/* Rol */}
                    <div className="modal-field">
                        <label className="modal-label">Cambiar rol</label>
                        <select
                            className="modal-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={isCurrentUser || isOtherAdmin}
                        >
                            <option value="ADMIN_ROLE">ADMIN_ROLE</option>
                            <option value="USER_ROLE">USER_ROLE</option>
                        </select>
                        {(isCurrentUser || isOtherAdmin) && (
                            <p className="modal-field-error" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <IconAlertCircle /> {isOtherAdmin ? "No puedes editar otro administrador." : "No puedes cambiar tu propio rol."}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cerrar
                    </button>
                    <button
                        type="button"
                        onClick={() => onSaveUser?.(user, form)}
                        disabled={loading || isOtherAdmin || !hasProfileChanges}
                        className="btn-secondary"
                        style={{ width: 'auto', padding: '9px 22px' }}
                    >
                        {loading ? <><span className="spinner" /> Guardando...</> : 'Guardar datos'}
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading || !hasChanges || isCurrentUser || isOtherAdmin}
                        className="btn-primary"
                        style={{ width: 'auto', padding: '9px 22px' }}
                    >
                        {loading
                            ? <><span className="spinner" /> Guardando...</>
                            : 'Guardar cambios'
                        }
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading || isCurrentUser || isOtherAdmin}
                        className="btn-danger"
                        style={{ width: 'auto', padding: '9px 22px' }}
                    >
                        Eliminar usuario
                    </button>
                </div>
            </div>
        </div>
    );
};