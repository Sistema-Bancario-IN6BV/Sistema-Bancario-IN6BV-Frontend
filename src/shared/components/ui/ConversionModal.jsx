import React, { useEffect, useState } from 'react';
import { convertAccountBalance } from '../../../shared/api/admin';

export const ConversionModal = ({ accountId, isOpen, onClose }) => {
  const [to, setTo] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setTo('USD');
      setResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConvert = async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const res = await convertAccountBalance(accountId, to);
      setResult(res?.data || null);
    } catch (err) {
      setResult({ error: err?.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="modal-overlay">
      <div className="modal wide">
        <div className="modal-header">
          <div className="modal-header-info">
            <h2 className="modal-title">Convertir Saldo</h2>
            <p className="modal-subtitle">Cuenta: {accountId}</p>
          </div>
          <button className="modal-close on-dark" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label className="modal-label">Moneda(s) destino (ej. USD o USD,EUR)</label>
            <input className="modal-input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <div className="modal-field">
            <button className="btn-primary" onClick={handleConvert} disabled={loading}>{loading ? 'Convirtiendo...' : 'Convertir'}</button>
          </div>

          {result && (
            <div className="modal-field">
              {result.error ? (
                <div className="text-rose-600">{result.error}</div>
              ) : result.success ? (
                <div>
                  <div className="info-row mb-3">Saldo original: <strong> {result.saldoOriginal} {result.monedaOrigen}</strong></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm bg-white rounded shadow-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-500 bg-slate-50">
                          <th className="px-3 py-2">Moneda</th>
                          <th className="px-3 py-2">Monto convertido</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.saldoConvertido && Object.entries(result.saldoConvertido).map(([curr, val]) => (
                          <tr key={curr} className="border-t">
                            <td className="px-3 py-2 font-medium">{curr}</td>
                            <td className="px-3 py-2">{typeof val === 'number' ? val.toFixed(2) : String(val)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <pre className="text-sm text-slate-700 bg-slate-50 p-3 rounded">{JSON.stringify(result, null, 2)}</pre>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ConversionModal;
