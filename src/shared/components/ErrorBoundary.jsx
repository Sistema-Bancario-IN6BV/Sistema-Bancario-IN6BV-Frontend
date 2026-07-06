import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Aquí podrías enviar el error a un servicio de logging
    // console.error('Captured error in ErrorBoundary', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--dash-bg, #070d1a)' }}>
          <div style={{ maxWidth: 720, textAlign: 'center', color: '#e8f0fe' }}>
            <h1 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Algo salió mal</h1>
            <p style={{ opacity: 0.8, marginBottom: 16 }}>Se ha producido un error inesperado. Intenta recargar la página.</p>
            <pre style={{ textAlign: 'left', color: '#ffdcdc', background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, overflowX: 'auto' }}>
              {String(this.state.error)}
            </pre>
            <div style={{ marginTop: 16 }}>
              <button onClick={() => window.location.reload()} style={{ padding: '8px 14px', borderRadius: 8, background: '#4f8ef7', color: '#081022', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Recargar</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
