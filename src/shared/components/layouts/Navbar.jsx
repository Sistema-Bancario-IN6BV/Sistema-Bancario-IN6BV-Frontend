// Navbar.jsx — REDISEÑO VISUAL · Lógica intacta
import { Typography } from "@material-tailwind/react";
import imgLogo from "../../../assets/img/LogoTipo.png";
import { AvatarUser } from "../ui/AvatarUser";

export const Navbar = () => {
        return (
        <nav style={{ backgroundColor: "var(--color-bg-sidebar)" }} className="border-b shadow-lg sticky top-0 z-50 text-white">
            <div className="w-full px-6 md:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img
                        src={imgLogo}
                        alt="Sistema Bancario logo"
                        className="h-12 w-12 md:h-14 md:w-14 rounded-full object-cover border border-white/30 shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
                        style={{ boxShadow: "0 4px 14px rgba(10,37,64,0.6)" }}
                    />
                    <Typography variant="h5" className="font-black text-white font-serif tracking-widest hidden sm:block">
                        Sistema Bancario
                    </Typography>
                </div>
                <div className="text-white">
                    <AvatarUser />
                </div>
            </div>
        </nav>
    );
};
