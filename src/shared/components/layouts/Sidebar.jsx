import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";
import {
    ChartBarIcon,
    BuildingStorefrontIcon,
    UsersIcon,
    ChartPieIcon,
    ShoppingBagIcon,
    BookOpenIcon,
    TableCellsIcon,
    CalendarDaysIcon,
    ReceiptPercentIcon,
    InboxStackIcon,
    BeakerIcon,
    HomeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from 'react';
import { getFavorites } from '../../api/admin';

const adminMenuItems = [
    { label: "Dashboard", to: "/admin", icon: HomeIcon },
    { label: "Cuentas", to: "/admin/accounts", icon: ChartBarIcon },
    { label: "Transacciones", to: "/admin/transactions", icon: TableCellsIcon },
    { label: "Usuarios", to: "/admin/users", icon: UsersIcon },
    { label: "Productos", to: "/admin/products", icon: ShoppingBagIcon },
    // Reportes eliminado — no disponible
];

const customerMenuItems = [
    { label: "Dashboard", to: "/client", icon: HomeIcon },
    { label: "Cuentas", to: "/client/accounts", icon: ChartBarIcon },
    { label: "Transacciones", to: "/client/transactions", icon: TableCellsIcon },
    { label: "Productos", to: "/client/products", icon: ShoppingBagIcon },
];

const menuItemsByRole = {
    ADMIN_ROLE: adminMenuItems,
    PLATFORM_ADMIN: adminMenuItems,
    RESTAURANT_ADMIN: adminMenuItems,
    USER_ROLE: customerMenuItems,
    CUSTOMER: customerMenuItems,
};

export const Sidebar = () => {
    const location  = useLocation();
    const user      = useAuthStore((state) => state.user);
    const role      = user?.role || "USER_ROLE";
    const menuItems = menuItemsByRole[role] || menuItemsByRole.USER_ROLE;
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await getFavorites();
                if (!mounted) return;
                setFavorites(res?.data || []);
            } catch (err) {
                // ignore
            }
        })();
        return () => { mounted = false; };
    }, []);

    // Quick-add form moved to Dashboard for better UX

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                {favorites && favorites.length > 0 && (
                    <div className="mb-3">
                        <div className="text-xs text-text-on-dark-muted px-2 mb-2">Favoritos</div>
                        {favorites.map((f) => (
                            <Link key={f._id || f.id || f.accountId} to={`/client/accounts?fav=${f.accountId}`} className="sidebar-item">
                                <StarIcon className="sidebar-item-icon text-yellow-400" />
                                <span className="sidebar-item-label">{f.alias || f.accountNumber || f.accountId}</span>
                            </Link>
                        ))}
                        <div className="sidebar-divider" />
                    </div>
                )}
                {/* Quick-add moved to Dashboard */}
                {menuItems.map((item) => {
                    const active = location.pathname === item.to;

                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`sidebar-item ${active ? 'active' : ''}`}
                        >
                            <item.icon className="sidebar-item-icon" />
                            <span className="sidebar-item-label">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};
