import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export const PurchaseModal = ({ isOpen, selectedProduct, activeAccounts, selectedAccountId, onAccountChange, onSubmit, onClose, loading, moneyFormatter }) => {
  if (!isOpen || !selectedProduct) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', padding: '16px' }}>
      <form
        onSubmit={onSubmit}
        style={{ width: '100%', maxWidth: '480px', borderRadius: '18px', background: 'rgba(10,18,35,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(0,212,160,0.2)', boxShadow: '0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '22px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(135deg, rgba(0,100,70,0.4) 0%, rgba(10,18,35,0.9) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(0,212,160,0.8)', marginBottom: '4px' }}>Confirmar</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#e8f0fe' }}>Comprar producto</h3>
          </div>
          <button type="button" onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(232,240,254,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XMarkIcon style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.875rem', color: 'rgba(232,240,254,0.5)', lineHeight: 1.6 }}>
            Confirma la compra de <strong style={{ color: '#e8f0fe' }}>{selectedProduct?.name}</strong> por <strong style={{ color: '#00d4a0' }}>{moneyFormatter.format(Number(selectedProduct?.price || 0))}</strong>.
          </p>
          <div style={{ borderRadius: '12px', padding: '14px 16px', background: 'rgba(0,212,160,0.06)', border: '1px solid rgba(0,212,160,0.15)' }}>
            <p style={{ fontWeight: 600, color: '#e8f0fe', fontSize: '0.875rem', marginBottom: '3px' }}>{selectedProduct?.name}</p>
            <p style={{ fontSize: '0.78rem', color: 'rgba(232,240,254,0.45)' }}>{selectedProduct?.description || 'Sin descripción'}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(232,240,254,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cuenta activa *</label>
            <select
              value={selectedAccountId}
              onChange={(e) => onAccountChange(e.target.value)}
              required
              style={{ padding: '10px 32px 10px 13px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.875rem', color: '#e8f0fe', outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(232,240,254,0.4)' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="" style={{ background: '#0a2540' }}>Selecciona una cuenta</option>
              {activeAccounts.map((account) => (
                <option key={account?._id || account?.id} value={account?._id || account?.id} style={{ background: '#0a2540' }}>
                  {account?.accountNumber || account?._id} — {moneyFormatter.format(Number(account?.balance || 0))}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: '9px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(232,240,254,0.6)', fontSize: '0.845rem', fontWeight: 500, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} style={{ padding: '9px 22px', borderRadius: '9px', background: 'rgba(0,212,160,0.15)', border: '1px solid rgba(0,212,160,0.35)', color: '#00d4a0', fontSize: '0.845rem', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Comprando...' : 'Confirmar compra'}
          </button>
        </div>
      </form>
    </div>
  );
};
