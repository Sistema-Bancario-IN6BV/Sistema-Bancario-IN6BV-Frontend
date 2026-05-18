import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
    login as loginRequest,
    register as registerRequest,
    forgotPassword as forgotPasswordRequest,
    resetPassword as resetPasswordRequest
} from "../../../shared/api/auth";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            userId: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            loading: false,
            error: null,
            successMessage: null,
            isAuthenticated: false,
            isLoadingAuth: true,

            clearError: () => set({ error: null }),
            clearSuccess: () => set({ successMessage: null }),

            checkAuth: () => {
                const token = get().token;

                set({
                    isLoadingAuth: false,
                    isAuthenticated: Boolean(token)
                })
            },

            logout: () => {
                set({
                    user: null,
                    userId: null,
                    token: null,
                    expiresAt: null,
                    isAuthenticated: false
                })
            },

            register: async (formData) => {
                try {
                    set({ loading: true, error: null, successMessage: null });
                    const { data } = await registerRequest(formData);
                    set({ loading: false, successMessage: data?.message || "Registro completado" });
                    return {
                        success: true,
                        emailVerificationRequired: data?.emailVerificationRequired,
                        data
                    }
                } catch (err) {
                    const message = err.response?.data.message || "Error al registrarse";
                    set({ error: message, loading: false});
                    return { success: false, error: message}
                }
            },

            login: async ({ emailOrUsername, password }) => {
                try {
                    set({ loading: true, error: null, successMessage: null });

                    const { data } = await loginRequest({ emailOrUsername, password });

                    const user = data.userDetails || null;

                    set({
                        user,
                        userId: user?.id,
                        token: data.token,
                        expiresAt: data.expiresAt || null,
                        loading: false,
                        isAuthenticated: true
                    });

                    return { success: true, user, token: data.token };
                } catch (err) {
                    // Garantiza que el catch dispare y que el usuario vea feedback.
                    console.error("Login error:", err);

                    const message =
                        err?.response?.data?.message ||
                        (err?.code === "ECONNABORTED" ? "Tiempo de espera agotado. Intenta nuevamente." : null) ||
                        err?.message ||
                        "Error de autenticación";

                    set({ error: message });
                    return { success: false, error: message };
                } finally {
                    // Evita el problema típico: se queda en loading si falla/timeout.
                    set({ loading: false });
                }
            },


            forgotPassword: async (email) => {
                try {
                    set({ loading: true, error: null });
                    const { data } = await forgotPasswordRequest(email);
                    set({ loading: false });
                    return { success: true, message: data.message };
                } catch (err) {
                    const message = err.response?.data.message || "Error al enviar correo de recuperación";
                    set({ error: message, loading: false });
                    return { success: false, error: message };
                }
            },

            resetPassword: async (token, newPassword) => {
                try {
                    set({ loading: true, error: null });
                    const { data } = await resetPasswordRequest(token, newPassword);
                    set({ loading: false });
                    return { success: true, message: data.message };
                } catch (err) {
                    const message = err.response?.data.message || "Error al restablecer la contraseña";
                    set({ error: message, loading: false });
                    return { success: false, error: message };
                }
            }
        }),
        { name: "auth-storage" }
    )
)
