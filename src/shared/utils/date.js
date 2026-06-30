// date.js — utilidades de fecha reutilizables
export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function isValidDate(value) {
  return !!parseDate(value);
}

export function formatDate(value, locale = 'es-GT', options = { day: '2-digit', month: 'short', year: 'numeric' }) {
  const d = parseDate(value);
  if (!d) return 'Fecha no disponible';
  try { return d.toLocaleDateString(locale, options); } catch { return 'Fecha no disponible'; }
}

export function formatDateTime(value, locale = 'es-GT', options = {}) {
  const d = parseDate(value);
  if (!d) return 'Fecha no disponible';
  try { return d.toLocaleString(locale, options); } catch { return 'Fecha no disponible'; }
}

export function getTime(value) {
  const d = parseDate(value);
  return d ? d.getTime() : null;
}

export default { parseDate, isValidDate, formatDate, formatDateTime, getTime };
