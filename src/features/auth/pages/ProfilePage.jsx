import { useEffect, useMemo, useState } from "react";
import { getProfile, updateProfile } from "../../../shared/api/auth";
import { useAuthStore } from "../store/authStore";
import { normalizeRole, normalizeAuthUser } from "../../../shared/utils/authRole";
import { Spinner } from "../../../shared/components/layouts/Spinner";
import defaultAvatarImg from "../../../assets/img/hero.png";
import { showError, showSuccess } from "../../../shared/utils/toast";

import { useAccountStore } from "../../accounts/store/useAccountStore";
import {
  getFavorites,
  addFavorite,
  updateFavorite,
  deleteFavorite,
  fastTransfer,
  getAccountByNumber,
} from "../../../shared/api/admin";

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L21 3z" />
  </svg>
);
const IconSave = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const IconCamera = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const glassCard = {
  borderRadius: "16px",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.09)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
  overflow: "hidden",
};

const inputBase = (readOnly) => ({
  width: "100%",
  padding: "10px 13px",
  borderRadius: "10px",
  fontSize: "0.875rem",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
  background: readOnly ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)",
  border: readOnly ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.14)",
  color: readOnly ? "rgba(232,240,254,0.45)" : "#e8f0fe",
  cursor: readOnly ? "not-allowed" : "text",
});

const labelBase = {
  fontSize: "0.62rem",
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(232,240,254,0.38)",
  marginBottom: "6px",
  display: "block",
};

const sectionHeader = () => ({
  padding: "16px 22px",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  background: "rgba(0,0,0,0.15)",
  display: "flex",
  alignItems: "center",
  gap: "10px",
});

const extractProfile = (raw) => {
  if (!raw) return null;
  if (raw.data && typeof raw.data === "object") return raw.data;
  if (raw.user && typeof raw.user === "object") return raw.user;
  return raw;
};

const emptyForm = (src = {}) => ({
  name: src?.name || src?.fullName || "",
  surname: src?.surname || "",
  username: src?.username || "",
  email: src?.email || "",
  phone: src?.phone || "",
  dpi: src?.dpi || "",
  address: src?.address || "",
  jobName: src?.jobName || src?.jobTitle || "",
  monthlyIncome: src?.monthlyIncome != null ? String(src.monthlyIncome) : "",
});

const SpinnerInline = () => (
  <span
    style={{
      display: "inline-block",
      width: "14px",
      height: "14px",
      borderRadius: "50%",
      border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff",
      animation: "profileRingSpin 0.7s linear infinite",
    }}
  />
);

const FormField = ({ label, name, value, onChange, readOnly, locked, help, type = "text", fullWidth, min }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <label style={labelBase}>
        {label}
        {locked && <span style={{ marginLeft: "6px", fontSize: "0.55rem", color: "rgba(248,113,113,0.6)", letterSpacing: "0.1em" }}>BLOQUEADO</span>}
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
          boxShadow: focused && !readOnly ? "0 0 0 3px rgba(79,142,247,0.2)" : "none",
          borderColor: focused && !readOnly ? "rgba(79,142,247,0.5)" : readOnly ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.14)",
        }}
      />
      {help && <p style={{ fontSize: "0.65rem", color: "rgba(232,240,254,0.25)", marginTop: "2px" }}>{help}</p>}
    </div>
  );
};

const InfoRow = ({ label, value, mono }) => (
  <div style={{ padding: "10px 13px", borderRadius: "10px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}>
    <p
      style={{
        fontSize: "0.58rem",
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "rgba(232,240,254,0.3)",
        marginBottom: "4px",
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontSize: "0.8rem",
        fontWeight: 600,
        color: "rgba(232,240,254,0.7)",
        wordBreak: "break-all",
        fontFamily: mono ? "monospace" : "inherit",
      }}
    >
      {value}
    </p>
  </div>
);

const getFavoriteId = (f) => f?._id || f?.id;

const getFavoriteAccountNumber = (f) =>
  f?.accountNumber || f?.account?.accountNumber || f?.accountId?.accountNumber || "";

const getFavoriteAccountStatus = (f) => f?.account?.status || f?.accountId?.status || "";

export const ProfilePage = () => {
  const user = useAuthStore((s) => s.user);
  const setState = useAuthStore.setState;

  const role = useMemo(() => normalizeRole(user?.role), [user?.role]);
  const isAdmin = role === "ADMIN_ROLE";
  const isClient = role === "USER_ROLE";

  // ----------------- Perfil -----------------
  const [form, setForm] = useState(emptyForm(user));
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { profile: raw } = await getProfile();
        const profile = extractProfile(raw);
        if (profile) {
          setForm(emptyForm(profile));
          setState((s) => ({ user: normalizeAuthUser({ ...s.user, ...profile }) }));
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
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setHasChanges(true);
  };

  const fieldLocked = {
    username: true,
    dpi: true,
    email: !isAdmin,
    phone: isClient,
    surname: !isAdmin,
  };

  const handleFile = (e) => {
    const picked = e.target.files?.[0] || null;
    setFile(picked);
    setHasChanges(true);
    if (picked) setPreviewUrl(URL.createObjectURL(picked));
  };

  // ✅ FIX PRINCIPAL: actualizar store sin recargar la página
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") fd.append(k, v);
      });
      if (file) fd.append("profilePicture", file);

      const { data } = await updateProfile(fd);
      showSuccess(data?.message || "Perfil actualizado correctamente");

      const updatedUser = extractProfile(data);
      if (updatedUser) {
        setState((s) => ({ user: normalizeAuthUser({ ...s.user, ...updatedUser }) }));
        setForm(emptyForm(updatedUser));
      }

      setEditing(false);
      setFile(null);
      setPreviewUrl(null);
      setHasChanges(false);
    } catch (err) {
      showError(err?.response?.data?.message || "Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = (() => {
    if (previewUrl) return previewUrl;
    const value = user?.profilePicture?.trim();
    if (!value || value.includes("default-avatar_ewzxwx.png")) return defaultAvatarImg;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    const base = import.meta.env.VITE_CLOUDINARY_BASE_URL || "https://res.cloudinary.com/db5rnorf/image/upload/";
    return `${base}${value.replace(/^\/+/, "")}`;
  })();

  // ----------------- Favoritos (CRUD + Listado + FastTransfer) -----------------
  const { accounts, loading: accountsLoading, getAccounts } = useAccountStore();

  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const [newFavAccountNumber, setNewFavAccountNumber] = useState("");
  const [newFavAlias, setNewFavAlias] = useState("");

  const [editingFavId, setEditingFavId] = useState(null);
  const [editingFavAlias, setEditingFavAlias] = useState("");
  const [favoriteActionLoading, setFavoriteActionLoading] = useState(false);

  const [fastFromAccount, setFastFromAccount] = useState("");
  const [fastFavoriteId, setFastFavoriteId] = useState("");
  const [fastAmount, setFastAmount] = useState("");
  const [fastTransferLoading, setFastTransferLoading] = useState(false);

  const loadFavorites = async () => {
    setFavoritesLoading(true);
    try {
      const res = await getFavorites();
      const favs = res?.data?.favorites ?? res?.data ?? [];
      setFavorites(Array.isArray(favs) ? favs : []);

      // default fast transfer favorite
      if (!fastFavoriteId && Array.isArray(favs) && favs.length > 0) {
        setFastFavoriteId(getFavoriteId(favs[0]));
      }
    } catch (err) {
      showError(err?.response?.data?.message || "Error al cargar favoritos");
    } finally {
      setFavoritesLoading(false);
    }
  };

  useEffect(() => {
    // Cargar cuentas y favoritos en paralelo
    const run = async () => {
      try {
        await Promise.all([getAccounts?.().catch(() => {}), loadFavorites()]);
      } catch {
        // no-op
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddFavorite = async () => {
    const accountNumber = String(newFavAccountNumber || "").trim();
    const alias = String(newFavAlias || "").trim();

    if (!accountNumber) {
      showError("Ingresa el número de cuenta");
      return;
    }
    if (!alias) {
      showError("Ingresa un alias para el favorito");
      return;
    }

    try {
      setFavoriteActionLoading(true);

      const resolved = await getAccountByNumber(accountNumber);
      const accountId =
        resolved?.data?.account?._id || resolved?.data?._id || resolved?.data?.account?.id || resolved?.data?.id;

      if (!accountId) {
        showError("No se pudo resolver la cuenta");
        return;
      }

      const res = await addFavorite({ accountId, alias });
      const created = res?.data?.favorite ?? res?.data ?? null;
      if (!created) {
        showError(res?.data?.message || "No se pudo crear el favorito");
        return;
      }

      setFavorites((prev) => [created, ...prev]);
      setNewFavAccountNumber("");
      setNewFavAlias("");
      showSuccess("Favorito agregado");

      if (!fastFavoriteId) setFastFavoriteId(getFavoriteId(created));
    } catch (err) {
      showError(err?.response?.data?.message || "Error al agregar favorito");
    } finally {
      setFavoriteActionLoading(false);
    }
  };

  const startEditFavorite = (f) => {
    const id = getFavoriteId(f);
    setEditingFavId(id);
    setEditingFavAlias(f?.alias || "");
  };

  const cancelEditFavorite = () => {
    setEditingFavId(null);
    setEditingFavAlias("");
  };

  const handleUpdateFavoriteAlias = async (f) => {
    const id = getFavoriteId(f);
    const alias = String(editingFavAlias || "").trim();

    if (!alias) {
      showError("El alias no puede estar vacío");
      return;
    }

    try {
      setFavoriteActionLoading(true);
      const res = await updateFavorite(id, { alias });
      const updated = res?.data?.updated ?? res?.data ?? null;
      if (!updated) {
        showError(res?.data?.message || "No se pudo actualizar el favorito");
        return;
      }

      setFavorites((prev) => prev.map((x) => (getFavoriteId(x) === id ? updated : x)));
      showSuccess("Alias actualizado");
      cancelEditFavorite();
    } catch (err) {
      showError(err?.response?.data?.message || "Error al actualizar favorito");
    } finally {
      setFavoriteActionLoading(false);
    }
  };

  const handleDeleteFavorite = async (f) => {
    const id = getFavoriteId(f);
    if (!id) return;

    try {
      setFavoriteActionLoading(true);
      const res = await deleteFavorite(id);
      const ok = res?.data?.success ?? true;
      if (!ok) {
        showError(res?.data?.message || "No se pudo eliminar");
        return;
      }

      setFavorites((prev) => prev.filter((x) => getFavoriteId(x) !== id));
      showSuccess("Favorito eliminado");

      if (fastFavoriteId === id) {
        const next = favorites.filter((x) => getFavoriteId(x) !== id)[0];
        setFastFavoriteId(next ? getFavoriteId(next) : "");
      }
    } catch (err) {
      showError(err?.response?.data?.message || "Error al eliminar favorito");
    } finally {
      setFavoriteActionLoading(false);
    }
  };

  const activeAccounts = useMemo(() => {
    return (accounts || []).filter((a) => a?.status === "ACTIVE");
  }, [accounts]);

  useEffect(() => {
    if (!fastFromAccount) {
      const first = activeAccounts[0];
      if (first) setFastFromAccount(first._id || first.id);
    }
  }, [activeAccounts, fastFromAccount]);

  const handleFastTransfer = async () => {
    const amount = Number(String(fastAmount || "").trim());

    if (!fastFavoriteId) {
      showError("Selecciona un favorito como destino");
      return;
    }
    if (!fastFromAccount) {
      showError("Selecciona la cuenta de origen");
      return;
    }
    if (!amount || amount <= 0) {
      showError("Ingresa un monto válido");
      return;
    }

    try {
      setFastTransferLoading(true);
      const res = await fastTransfer({
        favoriteId: fastFavoriteId,
        sourceAccount: fastFromAccount,
        amount,
      });

      const ok = res?.data?.success ?? res?.data?.status === 200 ?? true;
      if (!ok) {
        showError(res?.data?.message || "Error al realizar transferencia rápida");
        return;
      }

      showSuccess(res?.data?.message || "Transferencia rápida realizada");
      setFastAmount("");
    } catch (err) {
      showError(err?.response?.data?.message || "Error al realizar transferencia rápida");
    } finally {
      setFastTransferLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--dash-bg,#070d1a)",
        }}
      >
        <Spinner />
      </div>
    );
  }

  const displayName = [form.name, form.surname].filter(Boolean).join(" ") || "Usuario";

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "clamp(20px,3vw,36px)",
        background:
          "radial-gradient(ellipse 65% 45% at 8% 0%,rgba(79,142,247,0.08) 0%,transparent 55%), radial-gradient(ellipse 45% 35% at 92% 100%,rgba(0,212,160,0.06) 0%,transparent 50%), var(--dash-bg,#070d1a)",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
          <div>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(79,142,247,0.8)", marginBottom: "6px" }}>Configuración</p>
            <h1 style={{ fontFamily: '"DM Serif Display",Georgia,serif', fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 400, color: "#e8f0fe", letterSpacing: "-0.02em", marginBottom: "4px" }}>Mi Perfil</h1>
            <p style={{ fontSize: "0.845rem", color: "rgba(232,240,254,0.4)", lineHeight: 1.6 }}>
              {isAdmin ? "Actualiza tus datos generales (excepto DPI)" : "Gestiona tu información personal y configuración"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (editing) {
                setFile(null);
                setPreviewUrl(null);
                setHasChanges(false);
              }
              setEditing(!editing);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "11px 22px",
              borderRadius: "12px",
              fontSize: "0.875rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              background: editing ? "rgba(248,113,113,0.15)" : "linear-gradient(135deg,#4f8ef7,#2563eb)",
              color: editing ? "#f87171" : "#fff",
              boxShadow: editing ? "none" : "0 6px 22px rgba(79,142,247,0.38)",
              outline: editing ? "1px solid rgba(248,113,113,0.3)" : "none",
            }}
          >
            {editing ? "✕ Cancelar" : (
              <>
                <IconEdit /> Editar perfil
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px", alignItems: "start" }}>
            {/* LEFT */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ ...glassCard, padding: "28px 20px", textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-block", marginBottom: "18px" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: "-4px",
                      borderRadius: "50%",
                      background: isAdmin
                        ? "conic-gradient(from 0deg,#4f8ef7,#00d4a0,#4f8ef7)"
                        : "conic-gradient(from 0deg,#00d4a0,#a78bfa,#00d4a0)",
                      animation: "profileRingSpin 8s linear infinite",
                      zIndex: 0,
                    }}
                  />
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = defaultAvatarImg;
                    }}
                    style={{
                      position: "relative",
                      zIndex: 1,
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid rgba(7,13,26,0.9)",
                      display: "block",
                    }}
                  />
                  {editing && (
                    <label
                      htmlFor="profile-pic-input"
                      style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 2,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#e8f0fe",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <IconCamera />
                      <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em" }}>CAMBIAR</span>
                      <input id="profile-pic-input" type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
                    </label>
                  )}
                </div>

                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e8f0fe", marginBottom: "4px" }}>{displayName}</h2>
                <p style={{ fontSize: "0.8rem", color: "rgba(232,240,254,0.4)", marginBottom: "14px" }}>@{form.username || "—"}</p>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 14px",
                    borderRadius: "20px",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    background: isAdmin ? "rgba(79,142,247,0.15)" : "rgba(0,212,160,0.12)",
                    border: isAdmin ? "1px solid rgba(79,142,247,0.3)" : "1px solid rgba(0,212,160,0.25)",
                    color: isAdmin ? "#a5c8ff" : "#00d4a0",
                  }}
                >
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isAdmin ? "#4f8ef7" : "#00d4a0", display: "inline-block" }} />
                  {isAdmin ? "Administrador" : "Cliente"}
                </div>

                <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "20px 0" }} />
                <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <InfoRow label="ID Usuario" value={user?.id || "—"} mono />
                  <InfoRow label="DPI" value={form.dpi || "—"} />
                  <InfoRow label="Email" value={form.email || "—"} />
                </div>
              </div>

              {editing && (
                <div style={{ ...glassCard, padding: "14px 16px", background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)" }}>
                  <p style={{ fontSize: "0.75rem", color: "rgba(79,142,247,0.8)", lineHeight: 1.6 }}>📷 Haz clic sobre tu foto para cambiarla. Formatos: JPG, PNG. Máx. 5MB.</p>
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={glassCard}>
                <div style={sectionHeader()}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4f8ef7", boxShadow: "0 0 8px rgba(79,142,247,0.8)", display: "inline-block" }} />
                  <h3 style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(232,240,254,0.5)", margin: 0 }}>Información de Contacto</h3>
                </div>
                <div style={{ padding: "20px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <FormField label="Nombre" name="name" value={form.name} onChange={handleChange} readOnly={!editing} />
                  <FormField label="Apellido" name="surname" value={form.surname} onChange={handleChange} readOnly={!editing || fieldLocked.surname} locked={fieldLocked.surname && editing} />
                  <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} readOnly={!editing || fieldLocked.email} locked={fieldLocked.email && editing} />
                  <FormField label="Teléfono" name="phone" type="tel" value={form.phone} onChange={handleChange} readOnly={!editing || fieldLocked.phone} locked={fieldLocked.phone && editing} />
                </div>
              </div>

              <div style={glassCard}>
                <div style={sectionHeader()}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00d4a0", boxShadow: "0 0 8px rgba(0,212,160,0.8)", display: "inline-block" }} />
                  <h3 style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(232,240,254,0.5)", margin: 0 }}>Información Personal</h3>
                </div>
                <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <FormField label="Usuario" name="username" value={form.username} onChange={handleChange} readOnly locked help="No puede ser modificado" />
                    <FormField label="DPI" name="dpi" value={form.dpi} onChange={handleChange} readOnly locked help="No puede ser modificado" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <FormField label="Trabajo / Puesto" name="jobName" value={form.jobName} onChange={handleChange} readOnly={!editing} />
                    <FormField label="Ingreso Mensual (Q)" name="monthlyIncome" type="number" value={form.monthlyIncome} onChange={handleChange} readOnly={!editing} min="100" />
                  </div>
                  <FormField label="Dirección" name="address" value={form.address} onChange={handleChange} readOnly={!editing} fullWidth />
                </div>
              </div>

              {/* FAVORITOS */}
              <div style={glassCard}>
                <div style={sectionHeader()}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fbbf24", boxShadow: "0 0 8px rgba(251,191,36,0.55)", display: "inline-block" }} />
                  <h3 style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(232,240,254,0.5)", margin: 0 }}>Favoritos</h3>
                </div>

                <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label style={labelBase}>Agregar por número de cuenta</label>
                      <input
                        style={{ ...inputBase(false) }}
                        value={newFavAccountNumber}
                        onChange={(e) => setNewFavAccountNumber(e.target.value)}
                        placeholder="Ej: 123456789"
                      />
                    </div>
                    <div>
                      <label style={labelBase}>Alias</label>
                      <input
                        style={{ ...inputBase(false) }}
                        value={newFavAlias}
                        onChange={(e) => setNewFavAlias(e.target.value)}
                        placeholder="Ej: Cuenta de ahorros"
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={handleAddFavorite}
                      disabled={favoriteActionLoading}
                      style={{
                        flex: 1,
                        padding: "11px 14px",
                        borderRadius: "10px",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        border: "none",
                        cursor: favoriteActionLoading ? "not-allowed" : "pointer",
                        background: "linear-gradient(135deg,#4f8ef7,#2563eb)",
                        color: "#fff",
                        opacity: favoriteActionLoading ? 0.65 : 1,
                      }}
                    >
                      {favoriteActionLoading ? "Procesando…" : "+ Agregar favorito"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewFavAccountNumber("");
                        setNewFavAlias("");
                      }}
                      disabled={favoriteActionLoading}
                      style={{
                        padding: "11px 14px",
                        borderRadius: "10px",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        border: "1px solid rgba(255,255,255,0.1)",
                        cursor: favoriteActionLoading ? "not-allowed" : "pointer",
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(232,240,254,0.7)",
                        opacity: favoriteActionLoading ? 0.65 : 1,
                      }}
                    >
                      Limpiar
                    </button>
                  </div>

                  <div>
                    <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(232,240,254,0.4)", margin: "6px 0 10px" }}>
                      Tus favoritos
                    </p>

                    {favoritesLoading ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 0" }}>
                        <SpinnerInline />
                        <span style={{ color: "rgba(232,240,254,0.5)", fontSize: "0.85rem" }}>Cargando…</span>
                      </div>
                    ) : favorites.length === 0 ? (
                      <div style={{ padding: "16px 12px", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.12)", color: "rgba(232,240,254,0.35)" }}>
                        Aún no tienes favoritos.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {favorites.map((f) => {
                          const id = getFavoriteId(f);
                          const acctNum = getFavoriteAccountNumber(f);
                          const status = getFavoriteAccountStatus(f);

                          const isEditing = editingFavId === id;

                          return (
                            <div
                              key={id}
                              style={{
                                padding: "10px 12px",
                                borderRadius: "12px",
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                display: "flex",
                                gap: "12px",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: "0.9rem", fontWeight: 800, color: "#e8f0fe", marginBottom: "2px" }}>{f?.alias || "Favorito"}</p>
                                <p style={{ fontSize: "0.62rem", color: "rgba(232,240,254,0.35)", marginBottom: 0, wordBreak: "break-all" }}>
                                  Cuenta: {acctNum || "—"} {status ? `• Estado: ${status}` : ""}
                                </p>
                              </div>

                              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                {isEditing ? (
                                  <>
                                    <input
                                      style={{ ...inputBase(false), width: "170px" }}
                                      value={editingFavAlias}
                                      onChange={(e) => setEditingFavAlias(e.target.value)}
                                    />
                                    <button
                                      type="button"
                                      disabled={favoriteActionLoading}
                                      onClick={() => handleUpdateFavoriteAlias(f)}
                                      style={{
                                        padding: "8px 10px",
                                        borderRadius: "10px",
                                        border: "none",
                                        cursor: favoriteActionLoading ? "not-allowed" : "pointer",
                                        background: "rgba(79,142,247,0.25)",
                                        color: "#a5c8ff",
                                        fontWeight: 800,
                                        fontSize: "0.78rem",
                                      }}
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEditFavorite}
                                      disabled={favoriteActionLoading}
                                      style={{
                                        padding: "8px 10px",
                                        borderRadius: "10px",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        cursor: favoriteActionLoading ? "not-allowed" : "pointer",
                                        background: "rgba(255,255,255,0.06)",
                                        color: "rgba(232,240,254,0.7)",
                                        fontWeight: 800,
                                        fontSize: "0.78rem",
                                      }}
                                    >
                                      Cancelar
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      disabled={favoriteActionLoading}
                                      onClick={() => startEditFavorite(f)}
                                      style={{
                                        padding: "8px 10px",
                                        borderRadius: "10px",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        cursor: favoriteActionLoading ? "not-allowed" : "pointer",
                                        background: "rgba(255,255,255,0.06)",
                                        color: "rgba(232,240,254,0.7)",
                                        fontWeight: 800,
                                        fontSize: "0.78rem",
                                      }}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      disabled={favoriteActionLoading}
                                      onClick={() => handleDeleteFavorite(f)}
                                      style={{
                                        padding: "8px 10px",
                                        borderRadius: "10px",
                                        border: "none",
                                        cursor: favoriteActionLoading ? "not-allowed" : "pointer",
                                        background: "rgba(248,113,113,0.15)",
                                        color: "#f87171",
                                        fontWeight: 800,
                                        fontSize: "0.78rem",
                                      }}
                                    >
                                      Eliminar
                                    </button>
                                  </>
                                )}

                                {/* quick select for fast transfer */}
                                <button
                                  type="button"
                                  disabled={favoriteActionLoading}
                                  onClick={() => setFastFavoriteId(id)}
                                  style={{
                                    padding: "8px 10px",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    cursor: favoriteActionLoading ? "not-allowed" : "pointer",
                                    background: fastFavoriteId === id ? "rgba(251,191,36,0.18)" : "rgba(255,255,255,0.06)",
                                    color: fastFavoriteId === id ? "#fbbf24" : "rgba(232,240,254,0.7)",
                                    fontWeight: 800,
                                    fontSize: "0.78rem",
                                  }}
                                >
                                  Usar destino
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Fast Transfer */}
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(232,240,254,0.4)", margin: 0 }}>
                        Transferencia rápida
                      </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: 12 }}>
                      <div>
                        <label style={labelBase}>Desde cuenta (origen)</label>
                        <select
                          value={fastFromAccount}
                          onChange={(e) => setFastFromAccount(e.target.value)}
                          style={{ ...inputBase(false), cursor: "pointer" }}
                          disabled={accountsLoading}
                        >
                          <option value="">Selecciona cuenta</option>
                          {activeAccounts.map((a) => (
                            <option key={a._id || a.id} value={a._id || a.id}>
                              {a.accountNumber} • Saldo: Q {Number(a.balance || 0).toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={labelBase}>Destino (favorito)</label>
                        <select
                          value={fastFavoriteId}
                          onChange={(e) => setFastFavoriteId(e.target.value)}
                          style={{ ...inputBase(false), cursor: "pointer" }}
                          disabled={favoritesLoading || favorites.length === 0}
                        >
                          <option value="">Selecciona favorito</option>
                          {favorites.map((f) => (
                            <option key={getFavoriteId(f)} value={getFavoriteId(f)}>
                              {f?.alias || "Favorito"} • {getFavoriteAccountNumber(f)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <label style={labelBase}>Monto (Q)</label>
                      <input
                        style={{ ...inputBase(false) }}
                        type="number"
                        value={fastAmount}
                        onChange={(e) => setFastAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={handleFastTransfer}
                        disabled={fastTransferLoading}
                        style={{
                          flex: 1,
                          padding: "11px 14px",
                          borderRadius: "10px",
                          border: "none",
                          cursor: fastTransferLoading ? "not-allowed" : "pointer",
                          background: "linear-gradient(135deg,#e8f0fe,#c7dafe)",
                          color: "#0a2540",
                          fontWeight: 900,
                          fontSize: "0.9rem",
                          opacity: fastTransferLoading ? 0.7 : 1,
                        }}
                      >
                        {fastTransferLoading ? "Procesando…" : "Transferir"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFastAmount("");
                        }}
                        disabled={fastTransferLoading}
                        style={{
                          padding: "11px 14px",
                          borderRadius: "10px",
                          border: "1px solid rgba(255,255,255,0.1)",
                          cursor: fastTransferLoading ? "not-allowed" : "pointer",
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(232,240,254,0.7)",
                          fontWeight: 900,
                          fontSize: "0.9rem",
                        }}
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {editing && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFile(null);
                      setPreviewUrl(null);
                      setHasChanges(false);
                    }}
                    style={{
                      padding: "11px 22px",
                      borderRadius: "11px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(232,240,254,0.6)",
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !hasChanges}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "11px 26px",
                      borderRadius: "11px",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      background: saving || !hasChanges ? "rgba(79,142,247,0.3)" : "linear-gradient(135deg,#4f8ef7,#2563eb)",
                      border: "none",
                      color: saving || !hasChanges ? "rgba(232,240,254,0.4)" : "#fff",
                      cursor: saving || !hasChanges ? "not-allowed" : "pointer",
                      boxShadow: saving || !hasChanges ? "none" : "0 6px 22px rgba(79,142,247,0.38)",
                    }}
                  >
                    {saving ? (
                      <>
                        <SpinnerInline /> Guardando…
                      </>
                    ) : (
                      <>
                        <IconSave /> Guardar cambios
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      <style>{`@keyframes profileRingSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
};

export default ProfilePage;

