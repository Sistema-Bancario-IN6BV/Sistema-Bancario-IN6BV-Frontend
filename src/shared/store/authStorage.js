//authStorage.js
const AUTH_STORAGE_KEY = "auth-storage";

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getPersistedAuthState = () => {
  if (typeof localStorage === "undefined") return null;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  const parsed = safeParse(raw);
  return parsed?.state ?? null;
};

export const getPersistedAuthToken = () => {
  // Prefer in-memory global token (set by authStore) to avoid race where
  // persist hasn't flushed to localStorage yet.
  if (typeof window !== "undefined" && window.__AUTH_TOKEN__) return window.__AUTH_TOKEN__;
  return getPersistedAuthState()?.token ?? null;
};

export const clearPersistedAuth = () => {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
};
