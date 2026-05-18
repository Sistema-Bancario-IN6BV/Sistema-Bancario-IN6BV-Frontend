// RegisterCard.jsx — REDISEÑO VISUAL · Lógica intacta
import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

/* ── Iconos (idénticos a los originales) ── */
const IconUser = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);
const IconMail = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
);
const IconLock = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);
const IconPhone = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.1 1.11h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91A16 16 0 0 0 15 15.91l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
);
const IconId = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2"/><path d="M16 3v4M8 3v4M2 13h20"/>
    </svg>
);
const IconHome = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
);
const IconBriefcase = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
);
const IconDollar = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
);
const IconEye = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
);
const IconEyeOff = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
);

/* ── Estado inicial (idéntico al original) ── */
const INITIAL = {
    name: '', surname: '', username: '', email: '',
    password: '', phone: '', dpi: '',
    address: '', jobName: '', monthlyIncome: '',
};

/* ── Componente Field reutilizable ── */
const Field = ({ icon, label, name, type = 'text', value, onChange, placeholder, ...rest }) => (
    <div className="field-group">
        <label className="field-label">{icon}{label}</label>
        <input
            className="field-input"
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            {...rest}
        />
    </div>
);

const RegisterCard = ({ onGoLogin }) => {
    const [form, setForm]       = useState(INITIAL);
    const [showPwd, setShowPwd] = useState(false);
    const { register, loading, error, successMessage, clearError, clearSuccess } = useAuthStore();

    /* Handlers originales intactos */
    const handleChange = (e) => {
        const { name, value } = e.target;
        clearError();
        clearSuccess();
        setForm((p) => ({ ...p, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...form, monthlyIncome: parseFloat(form.monthlyIncome) || 0 };
        const res = await register(payload);
        if (res.success) setForm(INITIAL);
    };

    return (
        <div className="auth-form-container wide">
            {/* Header */}
            <p className="auth-form-eyebrow">Únete al sistema</p>
            <h2 className="auth-form-title">Crear cuenta</h2>
            <p className="auth-form-subtitle">Completa el formulario para registrarte como cliente.</p>

            <form onSubmit={handleSubmit}>
                {/* Fila 1: Nombre y Apellido */}
                <div className="register-row">
                    <Field icon={<IconUser />} label="Nombre" name="name" value={form.name}
                        onChange={handleChange} placeholder="Juan" required maxLength={25} />
                    <Field icon={<IconUser />} label="Apellido" name="surname" value={form.surname}
                        onChange={handleChange} placeholder="Pérez" required maxLength={25} />
                </div>

                {/* Fila 2: Usuario y Correo */}
                <div className="register-row">
                    <Field icon={<IconUser />} label="Usuario" name="username" value={form.username}
                        onChange={handleChange} placeholder="jperez" required />
                    <Field icon={<IconMail />} label="Correo" name="email" type="email" value={form.email}
                        onChange={handleChange} placeholder="juan@banco.com" required />
                </div>

                {/* Contraseña */}
                <div className="field-group">
                    <label className="field-label"><IconLock />Contraseña</label>
                    <div className="pwd-wrap">
                        <input
                            className="field-input"
                            type={showPwd ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Mínimo 8 caracteres"
                            required
                            minLength={8}
                        />
                        <button type="button" className="toggle-pwd" onClick={() => setShowPwd(p => !p)}>
                            {showPwd ? <><IconEyeOff /> Ocultar</> : <><IconEye /> Mostrar</>}
                        </button>
                    </div>
                </div>

                {/* Fila 3: Teléfono y DPI */}
                <div className="register-row">
                    <Field icon={<IconPhone />} label="Teléfono (8 dígitos)" name="phone" value={form.phone}
                        onChange={handleChange} placeholder="55551234" required maxLength={8} minLength={8} pattern="\d{8}" />
                    <Field icon={<IconId />} label="DPI (13 dígitos)" name="dpi" value={form.dpi}
                        onChange={handleChange} placeholder="1234567890101" required pattern="\d{13}" maxLength={13} minLength={13} />
                </div>

                {/* Dirección */}
                <div className="field-group">
                    <label className="field-label"><IconHome />Dirección</label>
                    <input
                        className="field-input"
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Zona 10, Guatemala"
                        required
                        maxLength={255}
                    />
                </div>

                {/* Fila 4: Trabajo e Ingreso */}
                <div className="register-row">
                    <Field icon={<IconBriefcase />} label="Trabajo / Puesto" name="jobName" value={form.jobName}
                        onChange={handleChange} placeholder="Desarrollador" maxLength={100} />
                    <Field icon={<IconDollar />} label="Ingreso mensual (Q)" name="monthlyIncome" type="number"
                        value={form.monthlyIncome} onChange={handleChange} placeholder="5000" required min="0" step="0.01" />
                </div>

                {/* Mensajes de estado */}
                {error          && <p className="msg error">{error}</p>}
                {successMessage && <p className="msg success">{successMessage}</p>}

                {/* Submit */}
                <button className="btn-primary" type="submit" disabled={loading}>
                    {loading
                        ? <><span className="spinner" /> Registrando...</>
                        : 'Crear mi cuenta'
                    }
                </button>
            </form>

            {/* Switch a login */}
            <p className="switch-link">
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={onGoLogin} className="link-btn">
                    Inicia sesión
                </button>
            </p>
        </div>
    );
};

export default RegisterCard;