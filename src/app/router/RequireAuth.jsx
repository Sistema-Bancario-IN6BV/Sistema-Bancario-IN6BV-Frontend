import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";

export const RequireAuth = ({ children }) => {
    const location = useLocation();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);

    if (!isAuthenticated || !token || !user) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    return children;
};