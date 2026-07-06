import { useNavigate } from "react-router-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-[#FDF9F0] px-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl flex flex-col items-center max-w-lg w-full border border-[#E8D4B4] relative overflow-hidden">
                {/* Decorative background element background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-50 to-transparent pointer-events-none"></div>

                <div className="bg-red-100 p-4 rounded-full mb-6 z-10 shadow-sm border border-red-200">
                    <ExclamationTriangleIcon className="w-14 h-14 text-red-600 drop-shadow-md" />
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1C1008] mb-3 text-center z-10">
                    Acceso Denegado
                </h1>
                
                <div className="w-16 h-1 bg-[#C8860A] mb-6 rounded-full opacity-70"></div>

                <p className="text-lg text-[#6D4C41] text-center mb-8 font-medium">
                    Lo sentimos, tu usuario no cuenta con los permisos necesarios para visualizar el contenido de este panel.
                </p>

                <button 
                    onClick={() => navigate("/")}
                    className="group relative w-full flex justify-center py-3.5 px-6 border border-transparent text-sm md:text-base font-bold rounded-xl text-[#1C1008] bg-[#F5C842] hover:bg-[#E3B530] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C8860A] shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 opacity-90"
                >
                    Volver al Inicio Seguro
                </button>
            </div>
        </div>
    )
}