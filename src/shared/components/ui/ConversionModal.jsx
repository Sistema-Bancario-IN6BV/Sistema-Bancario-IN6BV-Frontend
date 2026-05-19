import React, { useEffect, useState } from 'react';
import { convertAccountBalance } from '../../../shared/api/admin';

const IconX = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const ConversionModal = ({ accountId, isOpen, onClose }) => {
  const [to, setTo] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setTo('USD');
      setResult(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const parseCurrencies = (raw) => {
    if (!raw) return [];
    return raw
      .split(',')
      .map((s) => String(s || '').trim().toUpperCase())
      .filter(Boolean);
  };

  const validateCurrencies = (list) => {
    if (!Array.isArray(list) || list.length === 0) return false;
    // basic validation: currency codes 3 letters OR common code like 'USD'
    return list.every((c) => /^[A-Z]{3,4}$/.test(c));
  };

  const formatMoney = (value, currency) => {
    if (typeof value !== 'number') return String(value);
    try {
      return new Intl.NumberFormat('es-GT', { style: 'currency', currency }).format(value);
    } catch {
      return value.toFixed(2) + ` ${currency || ''}`;
    }
  };

  const handleConvert = async () => {
    setError(null);
    setResult(null);
    if (!accountId) return setError('Cuenta inválida');
    const list = parseCurrencies(to);
    if (!validateCurrencies(list)) return setError('Ingrese códigos de moneda válidos (ej. USD o USD,EUR)');

    setLoading(true);
    try {
      // backend accepts comma-separated currencies in `to`
      const param = list.join(',');
      const res = await convertAccountBalance(accountId, param);
      const data = res?.data ?? null;
      // normalize response for UI: expect { success, saldoOriginal, monedaOrigen, saldoConvertido }
      if (!data) return setError('Respuesta vacía del servidor');
      if (data.error || data.message) return setError(data.error || data.message);

      const saldoConvertidoRaw = data.saldoConvertido ?? data.converted ?? data.result ?? null;
      const saldoConvertido =
        saldoConvertidoRaw && typeof saldoConvertidoRaw === 'object'
          ? saldoConvertidoRaw
          : list.length === 1
            ? { [list[0]]: saldoConvertidoRaw }
            : null;

      setResult({
        saldoOriginal: data.saldoOriginal ?? data.originalBalance ?? null,
        monedaOrigen: data.monedaOrigen ?? data.currency ?? null,
        saldoConvertido,
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Error en la conversión');
    } finally {
      setLoading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    handleConvert();
  };

  return (
    <div className="modal-overlay">
      <div className="modal wide">
        <div className="modal-header-accent">
          <div className="modal-header-info">
            <h2 className="modal-title on-dark">Convertir Saldo</h2>
            <p className="modal-subtitle on-dark">Convierte el saldo de una cuenta a una o varias divisas.</p>
            <p className="modal-subtitle on-dark">Cuenta: {accountId}</p>
          </div>
          <button className="modal-close on-dark" type="button" onClick={onClose} aria-label="Cerrar">
            <IconX />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body" style={!result ? { paddingBottom: 24, flex: '0 0 auto' } : undefined}>
            <div className="modal-grid-2">
              <div className="modal-field">
                <label className="modal-label">Cuenta (solo lectura)</label>
                <input className="modal-input" value={accountId || ''} readOnly disabled />
              </div>

              <div className="modal-field">
                <label className="modal-label">Divisas destino</label>
                <input
                  className="modal-input"
                  value={to}
                  onChange={(ev) => setTo(ev.target.value)}
                  placeholder="USD o USD,EUR"
                  autoComplete="off"
                  disabled={loading}
                />
                <p className="text-xs text-slate-500">Formato: separa con coma. Ej: <strong>USD,EUR</strong></p>
                {error && <div className="modal-field-error">{error}</div>}
              </div>
            </div>

            {result && (
              <div className="modal-field">
                <div className="info-row" style={{ marginBottom: 12 }}>
                  Saldo original:{' '}
                  <strong>
                    {formatMoney(Number(result.saldoOriginal || 0), result.monedaOrigen || 'GTQ')} {result.monedaOrigen}
                  </strong>
                </div>

                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Moneda</th>
                        <th className="right">Monto convertido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.saldoConvertido ? (
                        Object.entries(result.saldoConvertido).map(([curr, val]) => (
                          <tr key={curr}>
                            <td>{curr}</td>
                            <td className="right">
                              {typeof val === 'number' ? formatMoney(val, curr) : String(val)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="data-table-empty">
                            No hay datos de conversión para mostrar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: 'auto', padding: '9px 22px' }}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Convirtiendo...
                </>
              ) : (
                'Convertir'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConversionModal;
