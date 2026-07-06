//authRole.js
export const CANONICAL_ROLES = {
    ADMIN_ROLE: "ADMIN_ROLE",
    USER_ROLE: "USER_ROLE",
};

const ROLE_ALIASES = {
    PLATFORM_ADMIN: CANONICAL_ROLES.ADMIN_ROLE,
    RESTAURANT_ADMIN: CANONICAL_ROLES.ADMIN_ROLE,
    CUSTOMER: CANONICAL_ROLES.USER_ROLE,
};

export const normalizeRole = (role) => {
    if (!role) {
        return null;
    }

    return CANONICAL_ROLES[role] || ROLE_ALIASES[role] || null;
};

export const getDashboardRoute = (role) => {
    const normalizedRole = normalizeRole(role);

    if (normalizedRole === CANONICAL_ROLES.ADMIN_ROLE) {
        return "/admin";
    }

    if (normalizedRole === CANONICAL_ROLES.USER_ROLE) {
        return "/client";
    }

    return null;
};

export const normalizeAuthUser = (user) => {
    if (!user) {
        return null;
    }

    return {
        ...user,
        role: normalizeRole(user.role),
    };
};

import { parseDate } from './date';

export const isTokenExpired = (expiresAt) => {
    if (!expiresAt) {
        return false;
    }

    const d = parseDate(expiresAt);
    if (!d) return false;
    const expiryTime = d.getTime();
    if (Number.isNaN(expiryTime)) {
        return false;
    }

    return expiryTime <= Date.now();
};