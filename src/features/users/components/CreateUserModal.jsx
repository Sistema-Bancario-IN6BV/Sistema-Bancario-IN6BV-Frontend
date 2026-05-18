// CreateUserModal.jsx — REDISEÑO VISUAL · Lógica intacta
import { useForm } from "react-hook-form";
import { Spinner } from "../../../shared/components/layouts/Spinner";

const IconX = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
);

export const CreateUserModal = ({ isOpen, onClose, onCreate, loading, error }) => {
    /* — react-hook-form original intacto — */
    const {
        register,
        handleSubmit,
        getValues,
        reset,
        formState: { errors },
    } = useForm();

    if (!isOpen) return null;

    /* — submit original intacto — */
    const submit = async (values) => {
        const formData = new FormData();
        formData.append("name",    values.name);
        formData.append("surname", values.surname);
        formData.append("username", values.username);
        formData.append("email",   values.email);
        formData.append("password", values.password);
        formData.append("phone",   values.phone);
        // Campos administrativos
        if (values.dpi) formData.append("dpi", values.dpi);
        if (values.address) formData.append("address", values.address);
        if (values.job) formData.append("job", values.job);
        if (values.monthlyIncome) formData.append("monthlyIncome", values.monthlyIncome);
        if (values.profilePicture?.[0]) {
            formData.append("profilePicture", values.profilePicture[0]);
        }
        const ok = await onCreate(formData);
        if (ok) { reset(); onClose(); }
    };

    return (
        <div className="modal-overlay">
            <div className="modal wide">
                {/* Header */}
                <div className="modal-header-accent">
                    <div className="modal-header-info">
                        <h2 className="modal-title on-dark">Nuevo Usuario</h2>
                        <p className="modal-subtitle on-dark">Completa la información para registrar un nuevo usuario</p>
                    </div>
                    <button className="modal-close on-dark" type="button" onClick={onClose} aria-label="Cerrar">
                        <IconX />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit(submit)}>
                    <div className="modal-body">

                        {/* Nombre + Apellido */}
                        <div className="modal-grid-2">
                            <div className="modal-field">
                                <label className="modal-label">Nombre</label>
                                <input
                                    className="modal-input"
                                    type="text"
                                    placeholder="Juan"
                                    {...register("name", { required: "El nombre es obligatorio" })}
                                />
                                {errors.name && <p className="modal-field-error">{errors.name.message}</p>}
                            </div>
                            <div className="modal-field">
                                <label className="modal-label">Apellido</label>
                                <input
                                    className="modal-input"
                                    type="text"
                                    placeholder="Pérez"
                                    {...register("surname", { required: "El apellido es obligatorio" })}
                                />
                                {errors.surname && <p className="modal-field-error">{errors.surname.message}</p>}
                            </div>
                        </div>

                        {/* Username + Teléfono */}
                        <div className="modal-grid-2">
                            <div className="modal-field">
                                <label className="modal-label">Nombre de usuario</label>
                                <input
                                    className="modal-input"
                                    type="text"
                                    placeholder="jperez"
                                    {...register("username", {
                                        required: "El nombre de usuario es obligatorio",
                                        minLength: { value: 3, message: "Debe tener al menos 3 caracteres" },
                                    })}
                                />
                                {errors.username && <p className="modal-field-error">{errors.username.message}</p>}
                            </div>
                            <div className="modal-field">
                                <label className="modal-label">Teléfono</label>
                                <input
                                    className="modal-input"
                                    type="tel"
                                    placeholder="55551234"
                                    {...register("phone", {
                                        required: "El teléfono es obligatorio",
                                        pattern: { value: /^[0-9]{8}$/, message: "Debe ser un número de 8 dígitos" },
                                    })}
                                />
                                {errors.phone && <p className="modal-field-error">{errors.phone.message}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="modal-field">
                            <label className="modal-label">Email</label>
                            <input
                                className="modal-input"
                                type="email"
                                placeholder="juan@banco.com"
                                {...register("email", {
                                    required: "El email es obligatorio",
                                    pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Formato de email inválido" },
                                })}
                            />
                            {errors.email && <p className="modal-field-error">{errors.email.message}</p>}
                        </div>

                        {/* DPI + Dirección */}
                        <div className="modal-grid-2">
                            <div className="modal-field">
                                <label className="modal-label">DPI (13 dígitos)</label>
                                <input
                                    className="modal-input"
                                    type="text"
                                    placeholder="1234567890101"
                                    {...register("dpi", {
                                        pattern: { value: /^[0-9]{13}$/, message: "Debe ser un número de 13 dígitos" },
                                    })}
                                />
                                {errors.dpi && <p className="modal-field-error">{errors.dpi.message}</p>}
                            </div>
                            <div className="modal-field">
                                <label className="modal-label">Dirección</label>
                                <input
                                    className="modal-input"
                                    type="text"
                                    placeholder="Zona 10, Ciudad"
                                    {...register("address")}
                                />
                            </div>
                        </div>

                        {/* Contraseña + Confirmar */}
                        <div className="modal-grid-2">
                            <div className="modal-field">
                                <label className="modal-label">Contraseña</label>
                                <input
                                    className="modal-input"
                                    type="password"
                                    placeholder="Mínimo 8 caracteres"
                                    {...register("password", {
                                        required: "La contraseña es obligatoria",
                                        minLength: { value: 8, message: "Debe tener al menos 8 caracteres" },
                                    })}
                                />
                                {errors.password && <p className="modal-field-error">{errors.password.message}</p>}
                            </div>
                            <div className="modal-field">
                                <label className="modal-label">Confirmar contraseña</label>
                                <input
                                    className="modal-input"
                                    type="password"
                                    placeholder="Repite la contraseña"
                                    {...register("confirmPassword", {
                                        required: "Debe confirmar su contraseña",
                                        validate: {
                                            matchesPassword: (v) =>
                                                v === getValues("password") || "Las contraseñas no coinciden",
                                        },
                                    })}
                                />
                                {errors.confirmPassword && <p className="modal-field-error">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        {/* Foto de perfil */}
                        <div className="modal-field">
                            <label className="modal-label">Foto de perfil (opcional)</label>
                            <input
                                className="file-input"
                                type="file"
                                accept="image/*"
                                {...register("profilePicture")}
                            />
                        </div>

                        {/* Trabajo / Ingreso mensual */}
                        <div className="modal-grid-2">
                            <div className="modal-field">
                                <label className="modal-label">Trabajo / Puesto</label>
                                <input
                                    className="modal-input"
                                    type="text"
                                    placeholder="Desarrollador"
                                    {...register("job")}
                                />
                            </div>
                            <div className="modal-field">
                                <label className="modal-label">Ingreso mensual (Q)</label>
                                <input
                                    className="modal-input"
                                    type="number"
                                    placeholder="5000"
                                    {...register("monthlyIncome", {
                                        valueAsNumber: true,
                                        validate: v => (v === undefined || v === null || v === "" || Number(v) >= 0) || "Ingreso inválido",
                                    })}
                                />
                            </div>
                        </div>

                        {error && <p className="msg error">{error}</p>}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: 'auto', padding: '9px 22px' }}
                        >
                            {loading
                                ? <><span className="spinner" /> Creando...</>
                                : 'Crear usuario'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};