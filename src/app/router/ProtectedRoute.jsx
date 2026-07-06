import { Navigate } from "react-router-dom";
import { Spinner } from "../../shared/components/layouts/Spinner";
import { useAuthStore } from "../../features/auth/store/authStore";
import { normalizeRole } from "../../shared/utils/authRole";


export const ProtectedRoute = ({ children }) => {
    
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore ((state) => state.isAuthenticated);
    const isLoadingAuth = useAuthStore((state) => state.isLoadingAuth);

    if(isLoadingAuth) return <Spinner />

    if(!isAuthenticated) return <Navigate to="/" replace />

    if (!normalizeRole(user?.role)) return <Navigate to="/unauthorized" replace />

    return children;
}