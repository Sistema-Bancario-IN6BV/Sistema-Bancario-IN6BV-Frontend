import { ResetPasswordForm } from "../components/ResetPasswordForm";

export const ResetPasswordPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-dark p-4 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-deep/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-xl bg-bg-card rounded-2xl shadow-xl border border-accent/20 p-8 md:p-12 relative z-10 transition-all duration-300">
                <div className="flex flex-col items-center justify-center mb-6">
                    <img 
                        src="/src/assets/img/LogoTipo.png" 
                        alt="Noir & Grill Logo" 
                        className="h-32 w-32 rounded-full object-cover drop-shadow-[0_0_15px_rgba(245,200,66,0.15)] mb-2"
                    />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-body font-serif tracking-wide mb-2">
                        Restablecer Contraseña
                    </h1>
                    <p className="text-text-muted text-sm md:text-base max-w-sm mx-auto">
                        Ingresa y confirma tu nueva contraseña
                    </p>
                </div>

                <div className="bg-bg-page/50 rounded-xl p-6 border border-accent/10">
                    <ResetPasswordForm />
                </div>
            </div>
        </div>
    );
};