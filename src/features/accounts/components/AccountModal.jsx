// AccountModal.jsx — REDISEÑO VISUAL · Lógica intacta
import { useEffect, useMemo, useState } from "react";

const IconX = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
);

const IconUser = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);

const IconHash = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/>
        <line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>
    </svg>
);

const IconDollar = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
);

const IconShield = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);

export const AccountModal = ({ mode, isOpen, initialValues, onClose, onSubmit, loading, users = [] }) => {
    const [form, setForm] = useState({
        externalUserId: "",
        balance: "",
        accountNumber: "",
        status: "ACTIVE",
    });
    const [searchUser, setSearchUser] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filteredUsers = useMemo(() => {
        if (!searchUser) return users;
        const lowerSearch = searchUser.toLowerCase();
        return users.filter(u => {
            const fullName = `${u.name || ''} ${u.surname || ''}`.toLowerCase();
            const dpi = String(u.dpi || '').toLowerCase();
            return fullName.includes(lowerSearch) || dpi.includes(lowerSearch);
        });
    }, [users, searchUser]);
    /* — useEffect original intacto — */
    useEffect(() => {
        if (!isOpen) return;
        setForm({
            externalUserId: initialValues?.externalUserId ?? "",
            balance:
                initialValues?.balance !== undefined && initialValues?.balance !== null
                    ? String(initialValues.balance)
                    : "",
            accountNumber: initialValues?.accountNumber ?? "",
            status: initialValues?.status ?? "ACTIVE",
        });
    }, [isOpen, initialValues]);

    const title = useMemo(() => {
        if (mode === "create") return "Agregar Cuenta";
        if (mode === "edit")   return "Editar Cuenta";
        return "Cuenta";
    }, [mode]);

    if (!isOpen) return null;

    /* — submit original intacto — */
    const submit = (e) => {
        e.preventDefault();
        const balanceNum = form.balance === "" ? 0 : Number(form.balance);
        if (Number.isNaN(balanceNum) || balanceNum < 0) {
            onSubmit?.({ ok: false, error: "Balance inválido" });
            return;
        }
        if (mode === "create" && !form.externalUserId) {
            onSubmit?.({ ok: false, error: "externalUserId requerido" });
            return;
        }

        if (mode === "create" && users.length > 0) {
            const userExists = users.some(u => u.uid === form.externalUserId || u.id === form.externalUserId);
            if (!userExists) {
                onSubmit?.({ ok: false, error: "El ID de usuario ingresado no existe en la base de datos." });
                return;
            }
        }

        const payload = {
            externalUserId: form.externalUserId || undefined,
            balance: balanceNum,
            accountNumber: form.accountNumber ? form.accountNumber : undefined,
            status: mode === "edit" ? form.status : undefined,
        };
        onSubmit?.({ ok: true, payload });
    };

    const statusBadge = {
        ACTIVE:  "badge badge-success",
        BLOCKED: "badge badge-warning",
        CLOSED:  "badge badge-neutral",
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                {/* Header */}
                <div className="modal-header-accent">
                    <div className="modal-header-info">
                        <h2 className="modal-title on-dark">{title}</h2>
                        <p className="modal-subtitle on-dark">
                            {mode === "create"
                                ? "Crea una cuenta para un cliente"
                                : "Actualiza los datos permitidos"}
                        </p>
                    </div>
                    <button className="modal-close on-dark" type="button" onClick={onClose} aria-label="Cerrar">
                        <IconX />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={submit}>
                    <div className="modal-body">

                        {/* externalUserId */}
                        {mode === "create" ? (
                            <div className="modal-field" style={{ position: 'relative' }}>
                                <label className="modal-label"><IconUser /> Buscar Usuario (Nombre, Apellido o DPI)</label>
                                <input
                                    className="modal-input"
                                    value={searchUser}
                                    onChange={(e) => {
                                        setSearchUser(e.target.value);
                                        const exactMatch = users.find(u => 
                                            u.uid === e.target.value || 
                                            u.id === e.target.value || 
                                            u.dpi === e.target.value
                                        );
                                        setForm((f) => ({ ...f, externalUserId: exactMatch ? (exactMatch.uid || exactMatch.id) : "" }));
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    placeholder="Escribe para buscar..."
                                    autoComplete="off"
                                />
                                {isDropdownOpen && (
                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: '#fff', border: '1px solid #ced6e0', borderRadius: '5px', maxHeight: '200px', overflowY: 'auto', boxShadow: '0px 10px 20px -13px rgba(32, 56, 117, 0.35)' }}>
                                        {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                                            <div 
                                                key={u.uid || u.id} 
                                                onClick={() => {
                                                    const idToUse = u.uid || u.id;
                                                    setSearchUser(`${u.name || ''} ${u.surname || ''} - DPI: ${u.dpi || 'N/A'}`);
                                                    setForm((f) => ({ ...f, externalUserId: idToUse }));
                                                    setIsDropdownOpen(false);
                                                }}
                                                style={{ padding: '10px 15px', borderBottom: '1px solid #eee', cursor: 'pointer', color: '#1a3b5d' }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f8fb'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                <strong>{u.name} {u.surname}</strong> <br/>
                                                <small style={{ color: '#4A6278' }}>DPI: {u.dpi || 'N/A'}</small>
                                            </div>
                                        )) : (
                                            <div style={{ padding: '10px 15px', color: '#4A6278' }}>No se encontraron usuarios...</div>
                                        )}
                                    </div>
                                )}
                                {/* Overlay to close dropdown on outside click */}
                                {isDropdownOpen && (
                                    <div 
                                        style={{ position: 'fixed', inset: 0, zIndex: 9 }} 
                                        onClick={() => setIsDropdownOpen(false)}
                                    ></div>
                                )}
                            </div>
                        ) : (
                            <div className="modal-field">
                                <label className="modal-label"><IconUser /> Usuario (solo lectura)</label>
                                <input className="modal-input" value={form.externalUserId} readOnly disabled />
                            </div>
                        )}

                        {/* Saldo */}
                        <div className="modal-field">
                            <label className="modal-label"><IconDollar /> Saldo</label>
                            <input
                                className="modal-input"
                                value={form.balance}
                                onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))}
                                placeholder="0.00"
                                inputMode="decimal"
                            />
                        </div>

                        {/* Estado — solo en edición */}
                        {mode === "edit" && (
                            <div className="modal-field">
                                <label className="modal-label"><IconShield /> Estado</label>
                                <select
                                    className="modal-select"
                                    value={form.status}
                                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="BLOCKED">BLOCKED</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                                {/* Preview del badge de estado */}
                                <div style={{ marginTop: 6 }}>
                                    <span className={statusBadge[form.status] || "badge badge-neutral"}>
                                        {form.status}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: 'auto', padding: '9px 22px' }}
                        >
                            {loading
                                ? <><span className="spinner" /> Procesando...</>
                                : mode === "create" ? "Crear cuenta" : "Guardar cambios"
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};