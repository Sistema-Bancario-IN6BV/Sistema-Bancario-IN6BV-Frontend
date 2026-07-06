import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import { useVerifyEmail } from "../hooks/useVerifyEmail";
import logo from "../../../assets/img/LogoTipo.png"
import { Spinner } from "../../../shared/components/layouts/Spinner";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

export const VerifyEmailPage = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const token = new URLSearchParams(location.search).get("token")

    const handleFinish = useCallback(() => {
        setTimeout(() => navigate("/"), 6000)
    }, [navigate])

    const { status, message } = useVerifyEmail(token, handleFinish);

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-[#FDF9F0] px-4">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl flex flex-col items-center max-w-lg w-full border border-[#E8D4B4]">
                <img
                    src={logo}
                    alt="Kinal Sports"
                    className="w-32 h-32 rounded-full object-cover mb-8 drop-shadow-md border-2 border-gray-100"
                />

                {status === "loading" && (
                    <div className="flex flex-col items-center">
                        <Spinner className="w-12 h-12 text-[#C8860A] mb-4" />
                        <h2 className="text-xl font-bold text-[#1C1008] mb-2">Verificando tu cuenta</h2>
                        <p className="text-[#6D4C41] text-center" aria-live="polite">
                            Por favor espera un momento mientras validamos tu correo electrónico...
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center animate-fade-in-up">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-[#1C1008] mb-2 text-center">¡Verificación Exitosa!</h2>
                        <p className="text-[#6D4C41] text-center mb-6" aria-live="polite">
                            {message}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4 overflow-hidden">
                            <div className="bg-[#C8860A] h-1.5 rounded-full animate-[progress_3s_ease-in-out_forwards]"></div>
                        </div>
                        <p className="text-sm text-gray-500">Redirigiendo al inicio de sesión...</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center animate-fade-in-up">
                        <ExclamationCircleIcon className="w-16 h-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-[#1C1008] mb-2 text-center">Enlace Inválido</h2>
                        <p className="text-red-600 text-center mb-6 font-medium" aria-live="polite">
                            {message}
                        </p>
                        <button 
                            onClick={() => navigate("/")}
                            className="bg-[#C8860A] hover:bg-[#A66E08] text-white font-bold py-2 px-6 rounded-lg transition-colors w-full shadow-md"
                        >
                            Volver al inicio
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}