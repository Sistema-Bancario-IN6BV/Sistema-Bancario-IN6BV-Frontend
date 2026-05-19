//AvatarUser.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";
import defaultAvatarImg from "../../../assets/img/hero.png";
import { normalizeRole } from "../../../shared/utils/authRole";

export const AvatarUser = () => {
    const { user, logout } = useAuthStore();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const toggleMenu = () => setOpen((prev) => !prev);

    useEffect(() => {
        const handleClickOutside = (evento) => {
            if (dropdownRef.current && !dropdownRef.current.contains(evento.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const avatarSrc =
        user?.profilePicture && user.profilePicture.trim() !== "" && !user.profilePicture.includes("default-avatar_ewzxwx.png")
            ? user.profilePicture
            : defaultAvatarImg;

    const roleDisplay = normalizeRole(user?.role)
        ? normalizeRole(user?.role).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())
        : "Cliente";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleMenu}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-bg-page/50 hover:bg-bg-page border border-accent/20 transition-all duration-300"
            >
                <img
                    src={avatarSrc}
                    alt={user?.name || user?.username}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-accent/40 cursor-pointer hover:border-accent transition-colors shadow-sm drop-shadow-md"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultAvatarImg;
                    }}
                />
                <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-text-body">
                        {user?.name || user?.username || "Usuario"}
                    </p>
                    <p className="text-xs text-text-muted">{roleDisplay}</p>
                </div>
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpen(false)}
                    />
                    <div style={{ backgroundColor: 'var(--color-bg-sidebar)' }} className="absolute right-0 mt-2 w-56 border border-white/10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.6)] animate-fadeIn z-20 overflow-hidden text-white">
                        <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            <p className="font-semibold text-white text-[15px] truncate">{user?.name || user?.username}</p>
                            <p className="text-xs text-white/80 truncate mt-0.5 tracking-wide">{user?.email}</p>
                        </div>
                        <ul className="p-2 text-sm text-white font-medium tracking-wide">
                            <li>
                                <Link to="/perfil" className="flex items-center gap-2 w-full p-2.5 rounded-lg hover:bg-white/10 transition-colors mb-1">Mi Perfil</Link>
                            </li>
                            <div className="border-t border-white/10 my-1" />

                            <li>
                                <button onClick={handleLogout} className="block w-full text-left p-2.5 rounded-lg hover:bg-white/10 transition-colors mt-1 font-semibold">Cerrar sesión</button>
                            </li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
};
