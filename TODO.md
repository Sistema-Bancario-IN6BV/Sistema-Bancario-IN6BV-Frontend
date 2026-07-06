# TODO - Favoritos en Perfil (ProfilePage)

- [ ] Inspeccionar `src/shared/api/admin.js` para confirmar existencia de: `getFavorites`, `addFavorite`, `updateFavorite`, `deleteFavorite`, `fastTransfer`.
- [ ] Inspeccionar `src/features/client/components/ClientDashboard.jsx` para reutilizar estilo/UX del bloque de favoritos.
- [ ] Implementar sección “Favoritos” en `src/features/auth/pages/ProfilePage.jsx`:
  - [ ] Estado: lista favoritos, loading, error
  - [ ] Cargar favoritos al montar
  - [ ] UI: listado + editar alias + eliminar
  - [ ] UI: formulario para agregar favorito (cuenta + alias)
  - [ ] UI: transferencia rápida (elegir cuenta origen + monto, usar `favoriteId`)

- [ ] Probar manualmente en frontend:
  - [ ] CRUD funciona (permiso/owner)
  - [ ] transfer fast crea transacción y actualiza UI
- [ ] Ajustar validaciones y errores (mensajes toast) para respuestas del backend.

