# 🏦 SISTEMA BANCARIO - GUÍA DE CONFIGURACIÓN

## 📋 Requisitos Previos

- Node.js 18+
- pnpm 10.29.3
- Frontend, Auth Service y Admin API ejecutándose

## 🚀 Instalación

### 1. Frontend (React + Vite)

```bash
cd Sistema-Bancario-IN6BV-Frontend
pnpm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local
```

Editar `.env.local`:
```
VITE_AUTH_URL=http://localhost:3001
VITE_ADMIN_URL=http://localhost:3002
```

### 3. Ejecutar en Desarrollo

```bash
pnpm run dev
```

Abrirá en: `http://localhost:5173`

## 🛠 Scripts Disponibles

```bash
pnpm run dev      # Iniciar servidor de desarrollo
pnpm run build    # Compilar para producción
pnpm run preview  # Vista previa de compilación
pnpm run lint     # Ejecutar ESLint
```

## 🧪 Pruebas de Integración

### Verificar Servicios Activos

Los servicios deben estar corriendo:

1. **Auth Service** (Puerto 3001)
   ```bash
   curl http://localhost:3001/health
   ```

2. **Admin API** (Puerto 3002)
   ```bash
   curl http://localhost:3002/health
   ```

3. **Frontend** (Puerto 5173)
   ```bash
   http://localhost:5173
   ```

### Ejecutar Pruebas

```bash
# Pruebas de integración
node tests/integration.test.js

# Pruebas de endpoints (bash)
bash tests/test-integration.sh
```

## 📚 Estructura del Proyecto

```
src/
├── app/                    # Configuración de la aplicación
│   ├── App.jsx            # Componente principal
│   ├── main.jsx           # Entry point
│   ├── router/            # Rutas y protección
│   └── Layouts/           # Layouts principales
├── features/              # Módulos de funcionalidades
│   ├── auth/              # Autenticación
│   ├── users/             # Gestión de usuarios
│   └── [otros]            # Otros módulos
├── shared/                # Código compartido
│   ├── api/               # Clientes HTTP
│   ├── components/        # Componentes genéricos
│   ├── utils/             # Utilidades
│   └── store/             # Zustand stores
└── styles/                # Estilos globales

tests/
├── integration.test.js    # Pruebas de integración
└── test-integration.sh    # Script de pruebas bash
```

## 🔐 Flujo de Autenticación

1. Usuario se registra/ingresa en AuthPage
2. Credenciales se envían a AuthService (Puerto 3001)
3. Auth Service retorna JWT token
4. Token se almacena en Zustand store (authStore)
5. Interceptor de Axios agrega token en headers
6. Usuario accede al Dashboard protegido

## 📡 API Endpoints

### Auth Service
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrarse
- `POST /auth/verify-email` - Verificar email
- `GET /auth/profile` - Obtener perfil

### Admin API
- `GET /accounts` - Listar cuentas
- `GET /transactions` - Listar transacciones
- `GET /users` - Listar usuarios
- `GET /products` - Listar productos

## 🎨 Diseño y Componentes

El proyecto usa:
- **React 18** - Framework
- **Tailwind CSS** - Estilos
- **Material Tailwind** - Componentes UI
- **Zustand** - State management
- **React Router v7** - Enrutamiento
- **Axios** - HTTP client
- **React Hot Toast** - Notificaciones

## ⚠️ Troubleshooting

### Error: CORS

```
La aplicación fue bloqueada por CORS
```

**Solución**: Verificar configuración de CORS en los backends.

### Error: 401 Unauthorized

```
Token inválido o expirado
```

**Solución**: Hacer login nuevamente. El token se almacena en localStorage.

### Error: conexión rechazada

```
Cannot connect to localhost:3001
```

**Solución**: Verificar que los servicios estén activos:
```bash
# Auth Service
cd Sistema-Bancario-AuthService
dotnet run

# Admin API
cd Sistema-Bancario
npm start
```

## 📝 Variables de Entorno Disponibles

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `VITE_AUTH_URL` | URL Auth Service | http://localhost:3001 |
| `VITE_ADMIN_URL` | URL Admin API | http://localhost:3002 |
| `VITE_API_TIMEOUT` | Timeout HTTP (ms) | 8000 |
| `VITE_DEBUG` | Modo debug | false |

## 🤝 Contribuir

1. Crear rama: `git checkout -b feature/nueva-funcionalidad`
2. Hacer cambios
3. Commit: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

## 📄 Licencia

ISC
