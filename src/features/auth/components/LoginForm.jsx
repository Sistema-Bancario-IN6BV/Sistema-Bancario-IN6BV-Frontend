import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDashboardRoute } from '../../../shared/utils/authRole';

export const LoginForm = ({ onForgot, onRegister }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ emailOrUsername: '', password: '' });
    const [errors, setErrors] = useState({});

    const login = useAuthStore((state) => state.login);
    const loading = useAuthStore((state) => state.loading);
    const error = useAuthStore((state) => state.error);

    const validate = () => {
        const nextErrors = {};
        if (!form.emailOrUsername.trim()) nextErrors.emailOrUsername = 'Este campo es obligatorio';
        if (!form.password.trim()) nextErrors.password = 'La contraseña es obligatoria';
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const res = await login(form);
        if (res.success) {
            const dashboardRoute = getDashboardRoute(res.user?.role);
            navigate(dashboardRoute || '/unauthorized');
            toast.success('¡Bienvenido al sistema bancario!', {
                duration: 2000,
                style: {
                    background: '#1C1008',
                    color: '#F5C842',
                    border: '1px solid #C8860A'
                },
                iconTheme: {
                    primary: '#F5C842',
                    secondary: '#1C1008',
                },
            });
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6 w-full max-w-md mx-auto">
            <div className="space-y-2 relative">
                <label htmlFor="emailOrUsername" className="block text-xs font-medium text-text-body tracking-wide mb-1.5">
                    CORREO O USUARIO
                </label>

                <div className="relative">
                    <input
                        id="emailOrUsername"
                        type="text"
                        placeholder="usuario@banco.com"
                        className="w-full px-4 py-3 text-sm bg-bg-page border border-text-mid/30 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-body placeholder:text-text-muted transition-all duration-300 shadow-sm"
                        value={form.emailOrUsername}
                        onChange={(e) => setForm((prev) => ({ ...prev, emailOrUsername: e.target.value }))}
                    />
                </div>

                {errors.emailOrUsername && (
                    <p className="text-error text-[10px] absolute -bottom-5 left-0 font-medium">
                        * {errors.emailOrUsername.message}
                    </p>
                )}
            </div>

            <div className="space-y-2 relative mt-4">
                <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="password" className="block text-xs font-medium text-text-body tracking-wide">
                        CONTRASEÑA
                    </label>
                    <button
                        type="button"
                        onClick={onForgot}
                        className="text-xs text-accent-deep hover:text-accent transition-colors underline-offset-4 hover:underline"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                <div className="relative">
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 text-sm bg-bg-page border border-text-mid/30 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-body placeholder:text-text-muted transition-all duration-300 shadow-sm"
                        value={form.password}
                        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    />
                </div>

                {errors.password && (
                    <p className="text-error text-[10px] absolute -bottom-5 left-0 font-medium">
                        * {errors.password.message}
                    </p>
                )}
            </div>

            {error && (
                <div className="bg-error/10 border border-error/30 text-error p-3 rounded-lg text-sm flex items-center gap-3 mt-4 shadow-sm">
                    <span>{error}</span>
                </div>
            )}

            <button
                type="submit"
                className="w-full bg-bg-dark hover:bg-[#0a0502] text-accent font-semibold py-3.5 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg border border-accent/20 hover:border-accent/40 active:transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-8"
                disabled={loading}
            >
                {loading ? 'CARGANDO...' : <span className="tracking-wider">INGRESAR AL SISTEMA</span>}
            </button>

            <div className="text-center pt-6 border-t border-accent/10 mt-6 md:mt-8">
                <p className="text-sm text-text-muted">
                    ¿No tienes una cuenta?{' '}
                    <button
                        type="button"
                        className="text-accent-deep hover:text-accent font-medium ml-1 transition-colors underline-offset-4 hover:underline"
                        onClick={onRegister}
                    >
                        Regístrate aquí
                    </button>
                </p>
            </div>
        </form>
    );
};
