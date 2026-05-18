import { useState } from "react";
import { Navigate } from "react-router-dom";
import LoginCard from "../components/LoginCard";
import RegisterCard from "../components/RegisterCard";
import { useAuthStore } from "../store/authStore";

export const AuthPage = () => {
    const [view, setView] = useState("login");
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
<<<<<<< Updated upstream
=======
    const userRole = useAuthStore((state) => state.user?.role);
    const canvasRef       = useRef(null);

    usePaperCanvas(canvasRef);

    if (isAuthenticated) {
        const destination = userRole === "ADMIN_ROLE" ? "/admin" : "/client";
        return <Navigate to={destination} replace />;
    }

    const isRegister = view === "register";
>>>>>>> Stashed changes

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-dark p-4 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-deep/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full flex items-center justify-center">
                {view === "register" ? (
                    <RegisterCard onGoLogin={() => setView("login")} />
                ) : (
                    <LoginCard onGoRegister={() => setView("register")} />
                )}
            </div>
        </div>
    );
};
