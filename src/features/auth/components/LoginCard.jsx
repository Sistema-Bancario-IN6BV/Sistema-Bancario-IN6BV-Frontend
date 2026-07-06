// LoginCard.jsx — REDISEÑO VISUAL · Lógica intacta
import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const IconMail = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
);

const IconLock = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);

const IconEye = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
);

const IconEyeOff = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
);

const getDashboardRoute = (role) => {
    if (role === 'ADMIN_ROLE' || role === 'PLATFORM_ADMIN' || role === 'RESTAURANT_ADMIN') {
        return '/admin';
    }

    return '/client';
};

const LoginCard = ({ onGoRegister }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        const result = await login({ emailOrUsername, password });
        if (result?.success) {
            navigate(getDashboardRoute(result.user?.role), { replace: true });
        }
    };

    return (
        <div className="auth-form-container">
            {/* Header */}
            <p className="auth-form-eyebrow">Bienvenido de vuelta</p>
            <h2 className="auth-form-title">Iniciar sesión</h2>
            <p className="auth-form-subtitle">Accede a tu cuenta para gestionar tus finanzas.</p>

            {/* Formulario — onSubmit, onChange y todos los handlers originales intactos */}
            <form onSubmit={handleSubmit}>
                {/* Campo: email / usuario */}
                <div className="field-group">
                    <label className="field-label" htmlFor="email-input">
                        <IconMail /> Email o Usuario
                    </label>
                    <input
                        spellCheck={false}
                        className="field-input"
                        type="text"
                        id="email-input"
                        placeholder="correo@banco.com"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        required
                    />
                </div>

                {/* Campo: contraseña */}
                <div className="field-group">
                    <div className="frg-pss">
                        <label className="field-label" htmlFor="password-input">
                            <IconLock /> Contraseña
                        </label>
                        <button type="button" className="frg-link" tabIndex={-1}>
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                    <div className="pwd-wrap">
                        <input
                            spellCheck={false}
                            className="field-input"
                            type={showPassword ? 'text' : 'password'}
                            id="password-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="toggle-pwd"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword ? <><IconEyeOff /> Ocultar</> : <><IconEye /> Mostrar</>}
                        </button>
                    </div>
                </div>

                {/* Error global */}
                {error && <p className="msg error">{error}</p>}

                {/* Submit — className y disabled idénticos en comportamiento */}
                <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? <span className="spinner" /> : 'Ingresar'}
                </button>
            </form>

            {/* Switch a registro */}
            <p className="switch-link">
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={onGoRegister} className="link-btn">
                    Regístrate
                </button>
            </p>
        </div>
    );
};

export default LoginCard;