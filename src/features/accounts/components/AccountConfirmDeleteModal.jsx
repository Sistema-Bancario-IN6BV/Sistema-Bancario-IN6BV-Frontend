// AccountConfirmDeleteModal.jsx — REDISEÑO VISUAL · Lógica intacta
import { useMemo } from "react";
import { useUIStore } from "../../../shared/components/ui/store/uiStore";

const IconAlertTriangle = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
);

const IconX = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
);

export const AccountConfirmDeleteModal = () => {
    /* — useUIStore original intacto — */
    const { confirmModal, closeConfirm } = useUIStore();

    const title   = confirmModal.title   || "Confirmar";
    const message = confirmModal.message || "¿Estás seguro?";

    if (!confirmModal.isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal narrow">
                {/* Header */}
                <div className="modal-header-danger">
                    <div className="modal-header-info">
                        <h2 className="modal-title on-dark">{title}</h2>
                    </div>
                    <button
                        className="modal-close on-dark"
                        type="button"
                        onClick={closeConfirm}
                        aria-label="Cerrar"
                    >
                        <IconX />
                    </button>
                </div>

                {/* Body */}
                <div className="confirm-body">
                    <div className="confirm-icon">
                        <IconAlertTriangle />
                    </div>
                    <p className="confirm-message">{message}</p>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button
                        type="button"
                        onClick={closeConfirm}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            confirmModal.onConfirm?.();
                            closeConfirm();
                        }}
                        className="btn-danger"
                        style={{ background: 'var(--color-danger)', color: '#fff', borderColor: 'var(--color-danger)' }}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};