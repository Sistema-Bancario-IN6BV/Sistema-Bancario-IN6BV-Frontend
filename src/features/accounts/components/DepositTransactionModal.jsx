import { useEffect, useMemo, useState } from "react";

const IconX = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
);

const formatAccountLabel = (account, owner) => {
    const number = account?.accountNumber || account?._id || account?.id || "";
    const ownerName = owner ? `${owner.name || ""} ${owner.surname || ""}`.trim() : "Cuenta";
    return `${number} · ${ownerName}`;
};

export const DepositTransactionModal = ({
    isOpen,
    onClose,
    onSubmit,
    loading,
    accounts = [],
    users = [],
    destinationAccount,
}) => {
    const [form, setForm] = useState({
        sourceAccount: "",
        destinationAccount: destinationAccount || "",
        amount: "",
        description: "",
    });

    useEffect(() => {
        if (!isOpen) return;

        setForm({
            sourceAccount: "",
            destinationAccount: destinationAccount || "",
            amount: "",
            description: "",
        });
    }, [isOpen, destinationAccount]);

    const activeAccounts = useMemo(
        () => accounts.filter((account) => account.status === "ACTIVE"),
        [accounts]
    );

    if (!isOpen) return null;

    const submit = (event) => {
        event.preventDefault();

        const amount = Number(form.amount);
        if (!form.sourceAccount) {
            onSubmit?.({ ok: false, error: "Debes seleccionar la cuenta origen" });
            return;
        }

        if (!form.destinationAccount) {
            onSubmit?.({ ok: false, error: "Debes indicar la cuenta destino" });
            return;
        }

        if (!amount || amount <= 0) {
            onSubmit?.({ ok: false, error: "Ingresa un monto válido" });
            return;
        }

        if (amount > 2000) {
            onSubmit?.({ ok: false, error: "El depósito no puede superar Q2000 por transacción" });
            return;
        }

        if (String(form.sourceAccount) === String(form.destinationAccount)) {
            onSubmit?.({ ok: false, error: "La cuenta origen y destino no pueden ser la misma" });
            return;
        }

        onSubmit?.({
            ok: true,
            payload: {
                type: "DEPOSIT",
                amount,
                sourceAccount: form.sourceAccount,
                destinationAccount: form.destinationAccount,
                description: form.description || "Depósito administrativo",
            },
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal wide">
                <div className="modal-header-accent">
                    <div className="modal-header-info">
                        <h2 className="modal-title on-dark">Registrar Depósito</h2>
                        <p className="modal-subtitle on-dark">Abona fondos a la cuenta seleccionada</p>
                    </div>
                    <button className="modal-close on-dark" type="button" onClick={onClose} aria-label="Cerrar">
                        <IconX />
                    </button>
                </div>

                <form onSubmit={submit}>
                    <div className="modal-body">
                        <div className="modal-grid-2">
                            <div className="modal-field">
                                <label className="modal-label">Cuenta origen</label>
                                <select
                                    className="modal-select"
                                    value={form.sourceAccount}
                                    onChange={(e) => setForm((prev) => ({ ...prev, sourceAccount: e.target.value }))}
                                >
                                    <option value="">Selecciona una cuenta</option>
                                    {activeAccounts.map((account) => {
                                        const owner = users.find((user) => user.uid === account.externalUserId || user.id === account.externalUserId);
                                        return (
                                            <option key={account._id || account.id} value={account._id || account.id}>
                                                {formatAccountLabel(account, owner)}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="modal-field">
                                <label className="modal-label">Cuenta destino</label>
                                <input
                                    className="modal-input"
                                    value={form.destinationAccount}
                                    onChange={(e) => setForm((prev) => ({ ...prev, destinationAccount: e.target.value }))}
                                    placeholder="Id o número de cuenta"
                                />
                                <p className="modal-field-help">Puedes pegar el ID o el número de cuenta destino.</p>
                            </div>
                        </div>

                        <div className="modal-grid-2">
                            <div className="modal-field">
                                <label className="modal-label">Monto</label>
                                <input
                                    className="modal-input"
                                    type="number"
                                    min="1"
                                    max="2000"
                                    step="0.01"
                                    value={form.amount}
                                    onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                                    placeholder="500.00"
                                />
                            </div>
                            <div className="modal-field">
                                <label className="modal-label">Descripción</label>
                                <input
                                    className="modal-input"
                                    value={form.description}
                                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Depósito de caja"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '9px 22px' }} disabled={loading}>
                            {loading ? <><span className="spinner" /> Procesando...</> : 'Registrar depósito'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};