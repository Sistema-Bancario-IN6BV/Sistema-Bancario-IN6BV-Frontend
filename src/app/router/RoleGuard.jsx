import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";
import { normalizeRole } from "../../shared/utils/authRole";

export const RoleGuard = ({ children, allowedRole = []}) => {
    
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const normalizedRole = normalizeRole(user?.role);
    const normalizedAllowedRoles = allowedRole.map(normalizeRole).filter(Boolean);
    const hasAccess = isAuthenticated && Boolean(normalizedRole) && normalizedAllowedRoles.includes(normalizedRole);

    if(!hasAccess){
        return <Navigate to="/unauthorized" replace/>
    }

    return children;
}