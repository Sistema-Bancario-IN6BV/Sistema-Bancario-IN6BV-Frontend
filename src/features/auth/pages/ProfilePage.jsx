import { useEffect, useMemo, useState } from "react";
import { getProfile, updateProfile } from "../../../shared/api/auth";
import { useAuthStore } from "../store/authStore";
import { normalizeRole } from "../../../shared/utils/authRole";

export const ProfilePage = () => {
    const user = useAuthStore((s) => s.user);
    const role = useMemo(() => normalizeRole(user?.role), [user?.role]);
    const isAdmin = role === "ADMIN_ROLE";
    const isClient = role === "USER_ROLE";
    const [form, setForm] = useState({
        name: user?.name || "",
        username: user?.username || "",
        email: user?.email || "",
        phone: user?.phone || "",
        dpi: user?.dpi || "",
        address: user?.address || "",
        jobName: user?.jobName || "",
        monthlyIncome: user?.monthlyIncome || "",
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const { profile } = await getProfile();
                if (profile) {
                    setForm({
                        name: profile?.name || profile?.fullName || "",
                        username: profile?.username || "",
                        email: profile?.email || "",
                        phone: profile?.phone || "",
                        dpi: profile?.dpi || "",
                        address: profile?.address || "",
                        jobName: profile?.jobName || profile?.jobTitle || "",
                        monthlyIncome: profile?.monthlyIncome || "",
                    });
                } else if (user) {
                    setForm((f) => ({
                        ...f,
                        name: user?.name || f.name,
                        username: user?.username || f.username,
                        email: user?.email || f.email,
                        phone: user?.phone || f.phone,
                        dpi: user?.dpi || f.dpi,
                        address: user?.address || f.address,
                        jobName: user?.jobName || f.jobName,
                        monthlyIncome: user?.monthlyIncome || f.monthlyIncome,
                    }));
                }
            } catch (e) {
                console.error("Error loading profile", e);
                if (user) {
                    setForm((f) => ({
                        ...f,
                        name: user?.name || f.name,
                        username: user?.username || f.username,
                        email: user?.email || f.email,
                        phone: user?.phone || f.phone,
                        dpi: user?.dpi || f.dpi,
                        address: user?.address || f.address,
                        jobName: user?.jobName || f.jobName,
                        monthlyIncome: user?.monthlyIncome || f.monthlyIncome,
                    }));
                }
            }
        };
        load();
    }, [user]);

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const fieldLocked = {
        username: !isAdmin,
        email: !isAdmin,
        phone: isClient,
        dpi: true,
    };

    const handleFile = (e) => setFile(e.target.files?.[0] || null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (v !== undefined && v !== null) fd.append(k, v);
            });
            if (file) fd.append("profilePicture", file);

            const { data } = await updateProfile(fd);
            alert(data?.message || "Perfil actualizado");
            // Optionally refresh local user object
            if (data?.user) {
                // update stored user if provided
                // useAuthStore doesn't expose direct setter; we reload page as fallback
                window.location.reload();
            }
        } catch (err) {
            const msg = err?.response?.data?.message || "Error al actualizar perfil";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Mi Perfil</h2>
            <p className="mb-4 text-sm text-text-muted">
                {isAdmin
                    ? "Como administrador puedes actualizar los datos generales del usuario, excepto el DPI y la contraseña."
                    : "Como cliente puedes actualizar tu nombre, dirección, trabajo e ingresos, pero no tu DPI ni tu contraseña."}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 bg-bg-card p-6 rounded-lg border border-accent/10 shadow-sm">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-400">No foto</span>
                        )}
                    </div>
                    <div>
                        <p className="font-semibold">{form.name || user?.name || "Usuario"}</p>
                        <p className="text-sm text-text-muted">{form.email || user?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-text-muted">Nombre</label>
                        <input name="name" value={form.name} onChange={handleChange} className="mt-1 input-base" />
                    </div>
                    <div>
                        <label className="block text-sm text-text-muted">Usuario</label>
                        <input name="username" value={form.username} onChange={handleChange} className="mt-1 input-base" readOnly={fieldLocked.username} />
                    </div>
                    <div>
                        <label className="block text-sm text-text-muted">Email</label>
                        <input name="email" value={form.email} onChange={handleChange} readOnly={fieldLocked.email} className="mt-1 input-base bg-gray-100" />
                    </div>
                    <div>
                        <label className="block text-sm text-text-muted">Teléfono</label>
                        <input name="phone" value={form.phone} onChange={handleChange} className="mt-1 input-base" readOnly={fieldLocked.phone} />
                    </div>
                    <div>
                        <label className="block text-sm text-text-muted">DPI</label>
                        <input name="dpi" value={form.dpi} onChange={handleChange} className="mt-1 input-base bg-gray-100" readOnly />
                    </div>
                    <div>
                        <label className="block text-sm text-text-muted">Trabajo / Puesto</label>
                        <input name="jobName" value={form.jobName} onChange={handleChange} className="mt-1 input-base" />
                    </div>
                    <div>
                        <label className="block text-sm text-text-muted">Ingresos Mensuales</label>
                        <input name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} className="mt-1 input-base" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-text-muted">Dirección</label>
                    <input name="address" value={form.address} onChange={handleChange} className="mt-1 input-base" readOnly={fieldLocked.address} />
                </div>

                <div>
                    <label className="block text-sm text-text-muted">Foto de perfil</label>
                    <input type="file" onChange={handleFile} className="mt-1" accept="image/*" />
                </div>

                <div className="flex items-center justify-end">
                    <button type="submit" className="btn-primary px-6 py-2" disabled={loading}>
                        {loading ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
