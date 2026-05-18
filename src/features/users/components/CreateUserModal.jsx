import { useForm } from "react-hook-form";
import { Spinner } from "../../../shared/components/layouts/Spinner";

export const CreateUserModal = ({
    isOpen,
    onClose,
    onCreate,
    loading,
    error,
}) => {
    const {
        register,
        handleSubmit,
        getValues,
        reset,
        formState: { errors },
    } = useForm();

    if (!isOpen) return null;

    const submit = async (values) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("surname", values.surname);
        formData.append("username", values.username);
        formData.append("email", values.email);
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
        if (ok) {
            reset();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
            <div className="bg-[#f6f1e8] rounded-2xl shadow-2xl border border-accent/20 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div
                    className="p-4 sm:p-5 text-bg-dark sticky top-0 z-10 bg-accent"
                >
                    <h2 className="text-xl sm:text-2xl font-bold font-serif">Nuevo Usuario</h2>
                    <p className="text-xs sm:text-sm font-semibold opacity-90 mt-1">
                        Completa la información para registrar un nuevo usuario
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(submit)}
                    className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-[#fffaf2]"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Nombre
                            </label>
                            <input
                                {...register("name", { required: "El nombre es obligatorio" })}
                                type="text"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.name && (
                                <p className="text-error text-xs font-semibold mt-1">{errors.name.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Apellido
                            </label>
                            <input
                                {...register("surname", {
                                    required: "El apellido es obligatorio",
                                })}
                                type="text"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.surname && (
                                <p className="text-error text-xs font-semibold mt-1">{errors.surname.message}</p>
                            )}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Nombre de Usuario
                            </label>
                            <input
                                {...register("username", {
                                    required: "El nombre de usuario es obligatorio",
                                    minLength: {
                                        value: 3,
                                        message: "Debe tener al menos 3 caracteres",
                                    },
                                })}
                                type="text"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.username && (
                                <p className="text-error text-xs font-semibold mt-1">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Teléfono
                            </label>
                            <input
                                {...register("phone", {
                                    required: "El teléfono es obligatorio",
                                    pattern: {
                                        value: /^[0-9]{8}$/,
                                        message: "Debe ser un número de 8 dígitos",
                                    },
                                })}
                                type="tel"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.phone && (
                                <p className="text-error text-xs font-semibold mt-1">{errors.phone.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Email
                        </label>
                        <input
                            {...register("email", {
                                required: "El email es obligatorio",
                                pattern: {
                                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                                    message: "Formato de email inválido",
                                },
                            })}
                            type="email"
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                        />
                        {errors.email && (
                            <p className="text-error text-xs font-semibold mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Contraseña
                            </label>
                            <input
                                {...register("password", {
                                    required: "La contraseña es obligatoria",
                                    minLength: {
                                        value: 8,
                                        message: "Debe tener al menos 8 caracteres",
                                    },
                                })}
                                type="password"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.password && (
                                <p className="text-error text-xs font-semibold mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Confirmar contraseña
                            </label>
                            <input
                                {...register("confirmPassword", {
                                    required: "Debe confirmar su contraseña",
                                    validate: {
                                        matchesPassword: (value) =>
                                            value === getValues("password") ||
                                            "Las contraseñas no coinciden",
                                    },
                                })}
                                type="password"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.confirmPassword && (
                                <p className="text-error text-xs font-semibold mt-1">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Foto de Perfil
                        </label>
                        <input
                            {...register("profilePicture")}
                            type="file"
                            accept="image/*"
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-bg-dark hover:file:bg-gold-light"
                        />
                    </div>

                    {error && <p className="text-error text-sm font-bold text-center">{error}</p>}

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-accent/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body font-bold transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent text-bg-dark font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {loading ? <Spinner small /> : "Crear usuario"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};