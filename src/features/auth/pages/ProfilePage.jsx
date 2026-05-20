// ProfilePage.jsx — REDISEÑO VISUAL + FIX DE CARGA DE DATOS
// La lógica de negocio (handleSubmit, fieldLocked, getProfile, updateProfile) es idéntica al original.
// Fix: getProfile() retorna { profile: data } donde data puede ser { user: {...} } o el objeto directo.
// Se normaliza el perfil extrayendo correctamente los campos sin importar la forma del response.

import { useEffect, useMemo, useState } from "react";
import { getProfile, updateProfile } from "../../../shared/api/auth";
import { useAuthStore } from "../store/authStore";
import { normalizeRole } from "../../../shared/utils/authRole";
import { Spinner } from "../../../shared/components/layouts/Spinner";
import defaultAvatarImg from "../../../assets/img/hero.png";
import { showError, showSuccess } from "../../../shared/utils/toast";

/* ── Inline SVG icons (idénticos al original) ── */
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L21 3z"/>
  </svg>
);
const IconSave = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconCamera = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

/* ── Design tokens ── */
const glass = {
  card: {
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.09)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
};

const inputBase = (readOnly) => ({
  width: '100%',
  padding: '10px 13px',
  borderRadius: '10px',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  background: readOnly ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
  border: readOnly ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.14)',
  color: readOnly ? 'rgba(232,240,254,0.45)' : '#e8f0fe',
  cursor: readOnly ? 'not-allowed' : 'text',
});

const labelBase = {
  fontSize: '0.62rem',
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(232,240,254,0.38)',
  marginBottom: '6px',
  display: 'block',
};

const sectionHeader = (accentColor = '#4f8ef7') => ({
  padding: '16px 22px',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  background: 'rgba(0,0,0,0.15)',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
});

/* ── Helper: extrae el perfil sin importar la forma del response ── */
// getProfile() → { profile: data } donde data puede ser:
//   { user: {...} }  ó  { name, email, ... }  ó  { data: { ... } }
const extractProfile = (raw) => {
  if (!raw) return null;
  // Si viene envuelto en .user
  if (raw.user && typeof raw.user === 'object') return raw.user;
  // Si viene envuelto en .data
  if (raw.data && typeof raw.data === 'object') return raw.data;
  // Si viene directo
  return raw;
};

const emptyForm = (src = {}) => ({
  name:          src?.name          || src?.fullName   || "",
  surname:       src?.surname       || "",
  username:      src?.username      || "",
  email:         src?.email         || "",
  phone:         src?.phone         || "",
  dpi:           src?.dpi           || "",
  address:       src?.address       || "",
  jobName:       src?.jobName       || src?.jobTitle   || "",
  monthlyIncome: src?.monthlyIncome || "",
});

export const ProfilePage = () => {
  const user    = useAuthStore((s) => s.user);
  const role    = useMemo(() => normalizeRole(user?.role), [user?.role]);
  const isAdmin  = role === "ADMIN_ROLE";
  const isClient = role === "USER_ROLE";

  const [form, setForm]           = useState(emptyForm(user));
  const [file, setFile]           = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [editing, setEditing]     = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  /* ── Load profile — fix de extracción de datos ── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // getProfile retorna { profile: data } donde data es el raw del backend
        const { profile: raw } = await getProfile();
        const profile = extractProfile(raw);

        if (profile) {
          setForm(emptyForm(profile));
        } else if (user) {
          setForm(emptyForm(user));
        }
      } catch (e) {
        console.error("Error loading profile", e);
        if (user) setForm(emptyForm(user));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ── Handlers — idénticos al original ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setHasChanges(true);
  };

  const fieldLocked = {
    username:  !isAdmin,
    email:     !isAdmin,
    phone:     isClient,
    dpi:       true,
    surname:   !isAdmin,
    address:   false,
  };

  const handleFile = (e) => {
    const picked = e.target.files?.[0] || null;
    setFile(picked);
    setHasChanges(true);
    if (picked) setPreviewUrl(URL.createObjectURL(picked));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      if (file) fd.append("profilePicture", file);

      const { data } = await updateProfile(fd);
      showSuccess(data?.message || "Perfil actualizado correctamente");
      setEditing(false);
      setFile(null);
      setPreviewUrl(null);
      setHasChanges(false);
      if (data?.user) window.location.reload();
    } catch (err) {
      showError(err?.response?.data?.message || "Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  /* ── Avatar src ── */
  const avatarSrc = (() => {
    if (previewUrl) return previewUrl;
    const value = user?.profilePicture?.trim();
    if (!value || value.includes("default-avatar_ewzxwx.png")) return defaultAvatarImg;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    const base = import.meta.env.VITE_CLOUDINARY_BASE_URL || "https://res.cloudinary.com/db5rnorf/image/upload/";
    return `${base}${value.replace(/^\/+/, "")}`;
  })();

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dash-bg,#070d1a)' }}>
        <Spinner />
      </div>
    );
  }

  const displayName = [form.name, form.surname].filter(Boolean).join(" ") || "Usuario";

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'clamp(20px,3vw,36px)',
      background: 'radial-gradient(ellipse 65% 45% at 8% 0%,rgba(79,142,247,0.08) 0%,transparent 55%), radial-gradient(ellipse 45% 35% at 92% 100%,rgba(0,212,160,0.06) 0%,transparent 50%), var(--dash-bg,#070d1a)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ══ Page header ══ */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(79,142,247,0.8)', marginBottom: '6px' }}>
              Configuración
            </p>
            <h1 style={{ fontFamily: '"DM Serif Display",Georgia,serif', fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: 400, color: '#e8f0fe', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Mi Perfil
            </h1>
            <p style={{ fontSize: '0.845rem', color: 'rgba(232,240,254,0.4)', lineHeight: 1.6 }}>
              {isAdmin ? "Actualiza tus datos generales (excepto DPI)" : "Gestiona tu información personal y configuración"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => { setEditing(!editing); if (editing) { setFile(null); setPreviewUrl(null); setHasChanges(false); } }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '11px 22px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 700,
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: editing
                ? 'rgba(248,113,113,0.15)'
                : 'linear-gradient(135deg,#4f8ef7,#2563eb)',
              color: editing ? '#f87171' : '#fff',
              boxShadow: editing ? 'none' : '0 6px 22px rgba(79,142,247,0.38)',
              outline: editing ? '1px solid rgba(248,113,113,0.3)' : 'none',
            }}
          >
            {editing ? '✕ Cancelar' : <><IconEdit /> Editar perfil</>}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>

            {/* ══ LEFT: Profile card ══ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Avatar card */}
              <div style={{ ...glass.card, padding: '28px 20px', textAlign: 'center' }}>
                {/* Avatar */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '18px' }}>
                  {/* Glow ring */}
                  <div style={{
                    position: 'absolute', inset: '-4px', borderRadius: '50%',
                    background: isAdmin
                      ? 'conic-gradient(from 0deg,#4f8ef7,#00d4a0,#4f8ef7)'
                      : 'conic-gradient(from 0deg,#00d4a0,#a78bfa,#00d4a0)',
                    animation: 'profileRingSpin 8s linear infinite',
                    zIndex: 0,
                  }} />
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = defaultAvatarImg; }}
                    style={{
                      position: 'relative', zIndex: 1,
                      width: '100px', height: '100px', borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid rgba(7,13,26,0.9)',
                      display: 'block',
                    }}
                  />
                  {/* Camera overlay when editing */}
                  {editing && (
                    <label htmlFor="profile-pic-input" style={{
                      position: 'absolute', inset: 0, zIndex: 2, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#e8f0fe', flexDirection: 'column', gap: '4px',
                    }}>
                      <IconCamera />
                      <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em' }}>CAMBIAR</span>
                      <input id="profile-pic-input" type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                {/* Name */}
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e8f0fe', marginBottom: '4px' }}>{displayName}</h2>
                <p style={{ fontSize: '0.8rem', color: 'rgba(232,240,254,0.4)', marginBottom: '14px' }}>@{form.username || '—'}</p>

                {/* Role badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 14px', borderRadius: '20px', fontSize: '0.62rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  background: isAdmin ? 'rgba(79,142,247,0.15)' : 'rgba(0,212,160,0.12)',
                  border: isAdmin ? '1px solid rgba(79,142,247,0.3)' : '1px solid rgba(0,212,160,0.25)',
                  color: isAdmin ? '#a5c8ff' : '#00d4a0',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAdmin ? '#4f8ef7' : '#00d4a0', display: 'inline-block' }} />
                  {isAdmin ? 'Administrador' : 'Cliente'}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '20px 0' }} />

                {/* Quick info */}
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <InfoRow label="ID Usuario" value={user?.id || '—'} mono />
                  <InfoRow label="DPI" value={form.dpi || '—'} />
                  <InfoRow label="Email" value={form.email || '—'} />
                </div>
              </div>

              {/* Photo help text when editing */}
              {editing && (
                <div style={{
                  ...glass.card, padding: '14px 16px',
                  background: 'rgba(79,142,247,0.08)',
                  border: '1px solid rgba(79,142,247,0.2)',
                }}>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(79,142,247,0.8)', lineHeight: 1.6 }}>
                    📷 Haz clic sobre tu foto para cambiarla. Formatos: JPG, PNG. Máx. 5MB.
                  </p>
                </div>
              )}
            </div>

            {/* ══ RIGHT: Form cards ══ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Contact info */}
              <div style={glass.card}>
                <div style={sectionHeader('#4f8ef7')}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4f8ef7', boxShadow: '0 0 8px rgba(79,142,247,0.8)' }} />
                  <h3 style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(232,240,254,0.5)', margin: 0 }}>
                    Información de Contacto
                  </h3>
                </div>
                <div style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <FormField label="Nombre" name="name" value={form.name} onChange={handleChange} readOnly={!editing} />
                  <FormField label="Apellido" name="surname" value={form.surname} onChange={handleChange} readOnly={!editing || fieldLocked.surname} locked={!editing || fieldLocked.surname} />
                  <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} readOnly={!editing || fieldLocked.email} locked={!editing || fieldLocked.email} />
                  <FormField label="Teléfono" name="phone" type="tel" value={form.phone} onChange={handleChange} readOnly={!editing || fieldLocked.phone} locked={!editing || fieldLocked.phone} />
                </div>
              </div>

              {/* Personal info */}
              <div style={glass.card}>
                <div style={sectionHeader('#00d4a0')}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00d4a0', boxShadow: '0 0 8px rgba(0,212,160,0.8)' }} />
                  <h3 style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(232,240,254,0.5)', margin: 0 }}>
                    Información Personal
                  </h3>
                </div>
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <FormField label="Usuario" name="username" value={form.username} onChange={handleChange} readOnly locked help="No puede ser modificado" />
                    <FormField label="DPI" name="dpi" value={form.dpi} onChange={handleChange} readOnly locked help="No puede ser modificado" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <FormField label="Trabajo / Puesto" name="jobName" value={form.jobName} onChange={handleChange} readOnly={!editing} />
                    <FormField label="Ingreso Mensual (Q)" name="monthlyIncome" type="number" value={form.monthlyIncome} onChange={handleChange} readOnly={!editing} min="100" />
                  </div>
                  <FormField label="Dirección" name="address" value={form.address} onChange={handleChange} readOnly={!editing} fullWidth />
                </div>
              </div>

              {/* Save actions */}
              {editing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => { setEditing(false); setFile(null); setPreviewUrl(null); setHasChanges(false); }}
                    style={{
                      padding: '11px 22px', borderRadius: '11px', fontSize: '0.875rem', fontWeight: 600,
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(232,240,254,0.6)', cursor: 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !hasChanges}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '11px 26px', borderRadius: '11px', fontSize: '0.875rem', fontWeight: 700,
                      background: (saving || !hasChanges) ? 'rgba(79,142,247,0.3)' : 'linear-gradient(135deg,#4f8ef7,#2563eb)',
                      border: 'none', color: (saving || !hasChanges) ? 'rgba(232,240,254,0.4)' : '#fff',
                      cursor: (saving || !hasChanges) ? 'not-allowed' : 'pointer',
                      boxShadow: (saving || !hasChanges) ? 'none' : '0 6px 22px rgba(79,142,247,0.38)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {saving ? <><SpinnerInline /> Guardando…</> : <><IconSave /> Guardar cambios</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes profileRingSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

/* ── Sub-components ── */
const FormField = ({ label, name, value, onChange, readOnly, locked, help, type = 'text', fullWidth, min }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: fullWidth ? '1 / -1' : undefined }}>
      <label style={labelBase}>
        {label}
        {locked && <span style={{ marginLeft: '6px', fontSize: '0.55rem', color: 'rgba(248,113,113,0.6)', letterSpacing: '0.1em' }}>BLOQUEADO</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        min={min}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputBase(readOnly),
          boxShadow: focused && !readOnly ? '0 0 0 3px rgba(79,142,247,0.2)' : 'none',
          borderColor: focused && !readOnly ? 'rgba(79,142,247,0.5)' : (readOnly ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.14)'),
        }}
      />
      {help && <p style={{ fontSize: '0.65rem', color: 'rgba(232,240,254,0.25)', marginTop: '2px' }}>{help}</p>}
    </div>
  );
};

const InfoRow = ({ label, value, mono }) => (
  <div style={{
    padding: '10px 13px', borderRadius: '10px',
    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)',
  }}>
    <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(232,240,254,0.3)', marginBottom: '4px' }}>{label}</p>
    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(232,240,254,0.7)', wordBreak: 'break-all', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</p>
  </div>
);

const SpinnerInline = () => (
  <span style={{
    display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
    animation: 'profileRingSpin 0.7s linear infinite',
  }} />
);

export default ProfilePage;