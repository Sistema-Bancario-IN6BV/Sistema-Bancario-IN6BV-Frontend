import { Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "../../features/auth/pages/AuthPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { RoleGuard } from "./RoleGuard.jsx"; // Importamos el RoleGuard
import { UnauthorizedPage } from "../../features/auth/pages/UnauthorizedPage.jsx";
import { VerifyEmailPage } from "../../features/auth/pages/VerifyEmailPage.jsx";
import { Accounts } from "../../features/accounts/components/Accounts.jsx";
import { Transactions } from "../../features/transactions/components/Transactions.jsx";
import { Users } from "../../features/users/components/Users.jsx";
import { Products } from "../../features/products/components/Products.jsx";
import { Services } from "../../features/services/components/Services.jsx";
// Reports feature removed (no available reports)
import { ClientDashboard } from "../../features/client/components/ClientDashboard.jsx";
import { AdminDashboard } from "../../features/dashboard/components/AdminDashboard.jsx";
import { DashboardPage } from "../Layouts/DashboardPage.jsx";
import { ProfilePage } from "../../features/auth/pages/ProfilePage.jsx";

export const AppRoutes = () => {
    return (
        <Routes>
            {/* RUTAS PUBLICAS */}
            <Route path="/" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* PORTAL DE ADMINISTRACIÓN (Protegido para ADMIN_ROLE) */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRole={["ADMIN_ROLE"]}>
                            <DashboardPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<Users />} />
                {/* Reportes eliminado */}
                <Route path="products" element={<Products />} />
                <Route path="services" element={<Services />} />
                <Route path="accounts" element={<Accounts />} />
                <Route path="transactions" element={<Transactions />} />
            </Route>

            {/* PORTAL DE CLIENTE (Protegido para USER_ROLE) */}
            <Route
                path="/client"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRole={["USER_ROLE"]}>
                            <DashboardPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            >
                <Route index element={<ClientDashboard />} />
                <Route path="accounts" element={<Accounts />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="products" element={<Products />} />
                <Route path="services" element={<Products />} />
            </Route>

            {/* Perfil: mostrar dentro del layout de Dashboard para mantener apariencia */}
            <Route
                path="/perfil"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            >
                <Route index element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};