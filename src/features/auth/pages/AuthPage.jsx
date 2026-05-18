// AuthPage.jsx — REDISEÑO VISUAL v4 · Lógica 100% intacta
// ─────────────────────────────────────────────────────────
// FIX: la animación de slide ahora usa exclusivamente
//   transform: translateX() en lugar de cambiar right↔left,
//   lo que permite que CSS transite suavemente.
//
// MECÁNICA:
//   auth-box  → siempre posicionado en right:0, width:50%
//               transform: translateX(0)      → LOGIN  (derecha)
//               transform: translateX(-100%)  → REGISTER (izquierda)
//
//   auth-layer → 200% ancho, también usa translateX:
//               translateX(0)    → muestra panel Login
//               translateX(-50%) → muestra panel Register
//
//   Ambas transiciones: 0.60s ease-in-out → movimiento suave.
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import LoginCard    from "../components/LoginCard";
import RegisterCard from "../components/RegisterCard";
import { useAuthStore } from "../store/authStore";

/* ── Logo SVG bancario ── */
const BankLogoIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L22 7V9H2V7L12 2Z" fill="white" fillOpacity="0.95"/>
        <rect x="4"  y="11" width="3" height="8" rx="0.5" fill="white" fillOpacity="0.82"/>
        <rect x="9"  y="11" width="3" height="8" rx="0.5" fill="white" fillOpacity="0.82"/>
        <rect x="14" y="11" width="3" height="8" rx="0.5" fill="white" fillOpacity="0.82"/>
        <rect x="19" y="11" width="3" height="8" rx="0.5" fill="white" fillOpacity="0.82"/>
        <rect x="2"  y="20" width="20" height="2" rx="0.5" fill="white"/>
    </svg>
);

/* ══════════════════════════════════════════════════
   Paper.js — figuras geométricas animadas
   ══════════════════════════════════════════════════ */
function usePaperCanvas(canvasRef) {
    useEffect(() => {
        if (!canvasRef.current) return;
        let cleaned  = false;
        let scriptEl = null;

        const init = () => {
            if (cleaned || !canvasRef.current) return;
            initPaper(canvasRef.current);
        };

        if (window.paper?.setup) {
            init();
        } else {
            scriptEl = document.createElement("script");
            scriptEl.src =
                "https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.17/paper-full.min.js";
            scriptEl.async = true;
            scriptEl.onload = init;
            document.head.appendChild(scriptEl);
        }

        return () => {
            cleaned = true;
            try {
                if (window.paper?.project) {
                    window.paper.project.clear();
                    window.paper.view?.remove();
                }
            } catch (_) {}
            if (scriptEl && document.head.contains(scriptEl))
                document.head.removeChild(scriptEl);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

function initPaper(canvas) {
    try {
        const paper = window.paper;
        paper.setup(canvas);
        const { Path, Group, view } = paper;

        const COLORS = [
            "rgba(90,156,245,0.20)",  "rgba(46,111,212,0.16)",
            "rgba(90,156,245,0.13)",  "rgba(255,255,255,0.09)",
            "rgba(46,111,212,0.13)",  "rgba(90,156,245,0.17)",
            "rgba(255,255,255,0.06)", "rgba(46,111,212,0.10)",
        ];
        const PATHS = [
            "M231,352l445-156L600,0L452,54L331,3L0,48L231,352",
            "M0,0l64,219L29,343l535,30L478,37l-133,4L0,0z",
            "M0,65l16,138l96,107l270-2L470,0L337,4L0,65z",
            "M333,0L0,94l64,219L29,437l570-151l-196-42L333,0",
            "M331.9,3.6l-331,45l231,304l445-156l-76-196l-148,54L331.9,3.6z",
            "M389,352l92-113l195-43l0,0l0,0L445,48l-80,1L122.7,0L0,275.2L162,297L389,352",
            "M 50 100 L 300 150 L 550 50 L 750 300 L 500 250 L 300 450 L 50 100",
            "M 700 350 L 500 350 L 700 500 L 400 400 L 200 450 L 250 350 L 100 300 L 150 50 L 350 100 L 250 150 L 450 150 L 400 50 L 550 150 L 350 250 L 650 150 L 650 50 L 700 150 L 600 250 L 750 250 L 650 300 L 700 350",
        ];

        const group = new Group();
        let pos = [];

        const calcPos = () => {
            const w = view.size.width, h = view.size.height;
            const mx = w / 2, my = h / 2;
            pos = [
                { x: mx - 50 + mx / 2, y: 150     },
                { x: 200,               y: my       },
                { x: w - 130,           y: h - 75   },
                { x: 0,                 y: my + 100  },
                { x: mx / 2 + 100,      y: 100      },
                { x: mx + 80,           y: h - 50   },
                { x: w + 60,            y: my - 50  },
                { x: mx + 100,          y: my + 100 },
            ];
        };

        const build = () => {
            calcPos();
            group.removeChildren();
            PATHS.forEach((pd, i) => {
                const s = new Path({
                    strokeColor: COLORS[i] ?? "rgba(90,156,245,0.12)",
                    strokeWidth: 1.5,
                    parent: group,
                });
                s.pathData = pd;
                s.scale(2);
                if (pos[i]) s.position = pos[i];
            });
        };

        build();

        view.onFrame = ({ count }) => {
            if (count % 4 !== 0) return;
            group.children.forEach((c, i) => c.rotate(i % 2 === 0 ? -0.1 : 0.1));
        };

        view.onResize = () => {
            calcPos();
            group.children.forEach((c, i) => { if (pos[i]) c.position = pos[i]; });
            const narrow = view.size.width < 700;
            [2, 3, 5].forEach(i => {
                if (group.children[i]) group.children[i].opacity = narrow ? 0 : 1;
            });
        };
    } catch (e) {
        console.warn("Paper.js init:", e);
    }
}

/* ══════════════════════════════════════
   Componente principal
   ══════════════════════════════════════ */
export const AuthPage = () => {
    const [view, setView] = useState("login");
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <div className="auth-root">

            {/* ── Fondo: mitad oscura + mitad clara + canvas ── */}
            <div className="auth-bg">
                <div className="auth-bg-left"  />
                <div className="auth-bg-right" />
                <canvas
                    ref={canvasRef}
                    className="auth-canvas"
                    id="auth-paperjs-canvas"
                    resize="true"
                />
            </div>

            {/*
              auth-box: siempre en right:0, se desplaza con translateX.
              · translateX(0)    → sobre fondo claro → LOGIN visible
              · translateX(-100%) → sobre fondo oscuro → REGISTER visible
            */}
            <div className={`auth-box${isRegister ? " is-register" : ""}`}>

                {/* Logo: cambia de estilo según el panel activo */}
                <div className={`auth-box-logo${isRegister ? " on-dark" : ""}`}>
                    <div className={`auth-logo-icon${isRegister ? "" : " on-light"}`}>
                        <BankLogoIcon />
                    </div>
                    <span className="auth-logo-name">Sistema Bancario</span>
                </div>

                {/*
                  auth-layer: 200% ancho.
                  · translateX(0)    → LOGIN  (panel izquierdo del layer)
                  · translateX(-50%) → REGISTER (panel derecho del layer)
                */}
                <div className={`auth-layer${isRegister ? " show-register" : ""}`}>

                    {/* Panel LOGIN */}
                    <div className="auth-panel auth-panel--light">
                        <div className="auth-panel-inner">
                            <LoginCard onGoRegister={() => setView("register")} />
                        </div>
                    </div>

                    {/* Panel REGISTER */}
                    <div className="auth-panel auth-panel--dark">
                        <div className="auth-panel-inner">
                            <RegisterCard onGoLogin={() => setView("login")} />
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};