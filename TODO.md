# TODO - Arreglo botón “Iniciar sesión” se queda cargando

- [ ] Analizar flujo de login (store + componente) para identificar por qué `loading` no vuelve a `false`.
- [ ] Actualizar `src/features/auth/store/authStore.js` para que `login()` haga `set({ loading:false })` en `finally`.
- [ ] Mejorar manejo de errores para timeouts / errores de red (mensaje legible + `console.error`).
- [ ] Ejecutar `pnpm lint` (si aplica) y/o `pnpm build` para validar.

