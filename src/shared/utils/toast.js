import { toast } from "react-hot-toast";

// Colores y estilos personalizados para tema bancario
const baseStyle = {
    borderRadius: "8px",
    fontWeight: 600,
    fontFamily: "inherit",
    fontSize: "0.95rem",
    padding: "14px 20px",
    boxShadow: "0 4px 12px 0 rgba(0,0,0,0.15)",
};

export const showSuccess = (message, options = {}) =>
    toast.success(message, {
        duration: 4000,
        ...options,
        style: {
            ...baseStyle,
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#fff",
            border: "1px solid #059669",
            ...options.style,
        },
        iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
        },
    });

export const showError = (message, options = {}) =>
    toast.error(message, {
        duration: 4000,
        ...options,
        style: {
            ...baseStyle,
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            color: "#fff",
            border: "1px solid #dc2626",
            ...options.style,
        },
        iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
        },
    });

export const showInfo = (message, options = {}) =>
    toast(message, {
        duration: 4000,
        ...options,
        style: {
            ...baseStyle,
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            color: "#fff",
            border: "1px solid #1d4ed8",
            ...options.style,
        },
        iconTheme: {
            primary: "#3b82f6",
            secondary: "#fff",
        },
    });

export const showWarning = (message, options = {}) =>
    toast(message, {
        duration: 4000,
        ...options,
        style: {
            ...baseStyle,
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            color: "#fff",
            border: "1px solid #d97706",
            ...options.style,
        },
        iconTheme: {
            primary: "#f59e0b",
            secondary: "#fff",
        },
    });

export const showLoading = (message, options = {}) => {
    return toast.loading(message, {
        ...options,
        style: {
            ...baseStyle,
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            color: "#fff",
            ...options.style,
        },
    });
};