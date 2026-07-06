import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const inputStyle = {
  padding: '10px 13px', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
  fontFamily: 'inherit', fontSize: '0.875rem', color: '#e8f0fe', outline: 'none',
};

const focusOn  = (e) => { e.target.style.borderColor = 'rgba(79,142,247,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.1)'; };
const focusOff = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; };

const labelStyle = { fontSize: '0.68rem', fontWeight: 600, color: 'rgba(232,240,254,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' };

export const ProductModal = ({ isOpen, editingId, form, onChange, onSubmit, onClose, loading }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', padding: '16px' }}>
      <form
        onSubmit={onSubmit}
        style={{ width: '100%', maxWidth: '500px', borderRadius: '18px', background: 'rgba(10,18,35,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(79,142,247,0.2)', boxShadow: '0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '22px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(135deg, rgba(10,37,64,0.9) 0%, rgba(26,75,140,0.5) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(79,142,247,0.8)', marginBottom: '4px' }}>{editingId ? 'Editar' : 'Nuevo'}</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#e8f0fe' }}>{editingId ? 'Editar Producto' : 'Crear Producto'}</h3>
          </div>
          <button type="button" onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(232,240,254,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XMarkIcon style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>Nombre *</label>
            <input name="name" value={form.name} onChange={onChange} required maxLength={150} placeholder="Nombre del producto" style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>Descripción</label>
            <textarea name="description" value={form.description} onChange={onChange} maxLength={500} rows={3} placeholder="Descripción del producto" style={{ ...inputStyle, resize: 'vertical' }} onFocus={focusOn} onBlur={focusOff} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>Precio *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(232,240,254,0.4)', fontSize: '0.875rem' }}>Q</span>
              <input name="price" value={form.price} onChange={onChange} required type="number" min="0" step="0.01" placeholder="0.00" style={{ ...inputStyle, width: '100%', paddingLeft: '28px' }} onFocus={focusOn} onBlur={focusOff} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: '9px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(232,240,254,0.6)', fontSize: '0.845rem', fontWeight: 500, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} style={{ padding: '9px 22px', borderRadius: '9px', background: 'rgba(79,142,247,0.18)', border: '1px solid rgba(79,142,247,0.35)', color: '#a5c8ff', fontSize: '0.845rem', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
};
