import { Spinner } from "../../../shared/components/layouts/Spinner";
import defaultAvatarImg from "../../../assets/img/hero.png";

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
    isOpen,
    onClose,
    user,
    currentUserId,
    onSaveRole,
    loading,
}) => {
    if (!isOpen || !user) return null;

    /* — Estado y lógica originales intactos — */
    const [role, setRole] = useState(user?.role || "USER_ROLE");

    const avatarSrc = (() => {
        const value = user?.profilePicture?.trim();
        if (!value) return defaultAvatarImg;

        if (value.startsWith("http://") || value.startsWith("https://")) {
            return value;
        }

        const cloudinaryBase =
            import.meta.env.VITE_CLOUDINARY_BASE_URL ||
            "https://res.cloudinary.com/db5rnorf/image/upload/";

        return `${cloudinaryBase}${value.replace(/^\/+/, "")}`;
    })();

    const isCurrentUser = currentUserId === user.id;
    const hasChanges = role !== user.role;

    const handleSave = async () => {
        if (!hasChanges || isCurrentUser) { onClose(); return; }
        await onSaveRole(user, role);
    };

    const roleBadge = {
        ADMIN_ROLE:   "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold bg-blue-600 text-white border border-blue-700/20",
        USER_ROLE:    "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold bg-emerald-600 text-white border border-emerald-700/20",
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
            <div className="bg-bg-dark rounded-2xl shadow-2xl border border-accent/20 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">

                <div
                    className="p-4 sm:p-5 text-bg-dark sticky top-0 z-10 bg-accent"
                >
                    <h2 className="text-xl sm:text-2xl font-bold font-serif">Detalle de Usuario</h2>
                    <p className="text-xs sm:text-sm font-semibold opacity-90 mt-1">
                        Consulta información y cambia el rol del usuario
                    </p>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto">
                    <div className="flex items-center gap-4">
                        <img
                            src={avatarSrc}
                            alt={user.username}
                            className="w-16 h-16 rounded-full object-cover border-2 border-accent"
                            onError={(e) => {
                                e.currentTarget.onError = null;
                                e.currentTarget.src = defaultAvatarImg;
                            }}
                        />
                        <div>
                            <p className="font-bold text-text-body text-lg">
                                {[user.name, user.surname].filter(Boolean).join(" ")}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-bg-page rounded-lg p-3 border border-accent/10">
                            <p className="text-xs text-text-muted">ID</p>
                            <p className="text-sm font-bold text-text-body break-all">{user.id}</p>
                        </div>
                        <div className="bg-bg-page rounded-lg p-3 border border-accent/10">
                            <p className="text-xs text-text-muted">Email</p>
                            <p className="text-sm font-bold text-text-body">{user.email}</p>
                        </div>
                        <div className="bg-bg-page rounded-lg p-3 border border-accent/10">
                            <p className="text-xs text-text-muted">Nombre</p>
                            <p className="text-sm font-bold text-text-body">{user.name || "-"}</p>
                        </div>
                        <div className="bg-bg-page rounded-lg p-3 border border-accent/10">
                            <p className="text-xs text-text-muted">Apellido</p>
                            <p className="text-sm font-bold text-text-body">{user.surname || "-"}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Rol
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={isCurrentUser}
                            className="w-full px-4 py-3 rounded-lg border border-accent/20 bg-bg-page text-text-body focus:outline-none focus:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="ADMIN_ROLE">ADMIN_ROLE</option>
                            <option value="USER_ROLE">USER_ROLE</option>
                        </select>
                        {isCurrentUser && (
                            <p className="text-xs text-error font-semibold mt-2">
                                No puedes cambiar tu propio rol.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-4 border-t border-accent/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body font-bold transition-colors"
                    >
                        Cerrar
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading || !hasChanges || isCurrentUser}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent text-bg-dark font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg"
                    >
                        {loading ? <Spinner small /> : "Guardar cambios"}
                    </button>
                </div>

            </div>
        </div>
    );
};