// Navbar.jsx — REDISEÑO VISUAL ÚNICAMENTE
// Props, imports y lógica original completamente intactos
import { Typography } from "@material-tailwind/react";
import imgLogo from "../../../assets/img/LogoTipo.png";
import { AvatarUser } from "../ui/AvatarUser";

export const Navbar = () => {
  return (
    <>
      <nav
        className="sticky top-0 z-50 w-full"
        style={{
          background:     'rgba(7,13,26,0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom:   '1px solid rgba(255,255,255,0.07)',
          boxShadow:      '0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Subtle top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(79,142,247,0.6) 30%, rgba(0,212,160,0.4) 65%, transparent 100%)',
          }}
        />

        <div className="w-full px-6 md:px-8 flex items-center justify-between" style={{ height: '68px' }}>

          {/* Brand */}
          <div className="flex items-center gap-4">
            {/* Logo wrapper with glow ring */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute', inset: '-3px',
                  borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, rgba(79,142,247,0.6), rgba(0,212,160,0.4), rgba(79,142,247,0.6))',
                  animation: 'navLogoSpin 8s linear infinite',
                  zIndex: 0,
                }}
              />
              <img
                src={imgLogo}
                alt="Sistema Bancario logo"
                style={{
                  position: 'relative', zIndex: 1,
                  width: '44px', height: '44px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(7,13,26,0.9)',
                  display: 'block',
                }}
              />
            </div>

            {/* Brand name */}
            <div className="hidden sm:flex flex-col">
              <Typography
                variant="h6"
                style={{
                  fontFamily:    '"DM Serif Display", Georgia, serif',
                  fontWeight:    700,
                  fontSize:      '1.05rem',
                  letterSpacing: '0.06em',
                  color:         '#e8f0fe',
                  lineHeight:    1.1,
                  margin:        0,
                }}
              >
                Sistema Bancario
              </Typography>
              <span
                style={{
                  fontSize:      '0.6rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color:         'rgba(79,142,247,0.7)',
                  fontWeight:    600,
                }}
              >
                Banca en línea
              </span>
            </div>
          </div>

          {/* Center: live status pill */}
          <div
            className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{
              background:   'rgba(255,255,255,0.05)',
              border:       '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span
              style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: '#00d4a0',
                boxShadow: '0 0 8px rgba(0,212,160,0.8)',
                display: 'inline-block',
                animation: 'navPulse 2s ease-in-out infinite',
              }}
            />
            <span style={{ fontSize: '0.7rem', color: 'rgba(232,240,254,0.5)', letterSpacing: '0.12em', fontWeight: 600 }}>
              SISTEMA ACTIVO
            </span>
          </div>

          {/* Right: Avatar */}
          <div style={{ color: '#e8f0fe' }}>
            <AvatarUser />
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes navLogoSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes navPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(0,212,160,0.8); }
          50%       { opacity: 0.5; box-shadow: 0 0 4px rgba(0,212,160,0.3); }
        }
      `}</style>
    </>
  );
};