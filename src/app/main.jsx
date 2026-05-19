import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from "@material-tailwind/react"
import { Toaster } from 'react-hot-toast'
import '../styles/index.css'

// Forzar inicio en pantalla de login: eliminar estado de sesión persistente
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('auth-storage');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
