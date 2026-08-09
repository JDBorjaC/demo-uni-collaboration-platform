# ESTADO Y SEGUIMIENTO DEL MVP (PROGRESS.md)

> Este archivo es mantenido automáticamente por los agentes y desarrolladores tras cada subtarea completada. Sirve como fuente rápida de verdad sobre el avance del proyecto.

## 📌 Estado Actual

- **Fase Actual**: Fase 5 – Gestión de Proyectos, Colaboradores y Contribuciones
- **Estado**: 🟡 En progreso
- **Subtarea en Curso**: Tarea 5.3
- **Completadas**: Fases 1.1–3, 2.1, 3.1–3.3, 4.1–4.3, 5.1–5.2
- **Último Commit de Subtarea**: `feat(dashboard): enhance project manage tabs with contribution types, reject comment flow, member avatars and formatted dates (Tarea 5.2)`

---

## 📋 Checklist de Seguimiento de Subtareas

### Fase 1: Actualización del Modelo de Datos y Permisos
- [x] **Tarea 1.1**: Refactorización de `lib/db/schema.ts` (Roles extendidos, skills, objetivos, tipo contribución, audit fields).
- [x] **Tarea 1.2**: Actualización de Schemas Zod (`lib/validations.ts`) y Helper de Permisos (`lib/permissions.ts`).
- [x] **Tarea 1.3**: Sincronización de Base de Datos con Drizzle (`npx drizzle-kit push`).

### Fase 2: Script de Poblamiento de Datos (Seed Script)
- [x] **Tarea 2.1**: Creación de `scripts/seed.ts` con datos demo realistas (usuarios, categorías, instituciones, proyectos, postulaciones, contribuciones).

### Fase 3: Experiencia Pública y Descubrimiento (Landing & Catálogo)
- [x] **Tarea 3.1**: Rediseño e implementación de Landing Page pública (`app/page.tsx`).
- [x] **Tarea 3.2**: Página de exploración y búsqueda de proyectos (`app/projects/page.tsx`).
- [x] **Tarea 3.3**: Vista detallada pública de proyecto (`app/projects/[slug]/page.tsx`).

### Fase 4: Onboarding y Panel de Usuario (Dashboard)
- [x] **Tarea 4.1**: Mejora de Onboarding (`app/onboarding/page.tsx` & `components/onboarding-form.tsx`).
- [x] **Tarea 4.2**: Expansión del Dashboard de Usuario (`app/dashboard/page.tsx`).
- [x] **Tarea 4.3**: Conexión de Notificaciones en tiempo real (`components/notifications-menu.tsx`).

### Fase 5: Gestión de Proyectos, Colaboradores y Contribuciones
- [x] **Tarea 5.1**: Formulario de Creación/Edición de Proyecto (`components/project-form.tsx`) — campos objectives, collaborationNeeds (chips) y universityAffiliationId; persistencia en DB.
- [x] **Tarea 5.2**: Panel de Control del Líder — badge de tipo de contribución, enlace a contentUrl, flujo de rechazo con comentario, avatar y joinedAt en miembros, fechas en aplicaciones.
- [ ] **Tarea 5.3**: Formulario de Contribuciones con Edición y Retiro (`components/new-contribution-dialog.tsx`).

### Fase 6: Módulo de Administración, Moderación y Auditoría
- [ ] **Tarea 6.1**: Layout y Protección del Panel Admin (`app/admin/layout.tsx`).
- [ ] **Tarea 6.2**: Cola de Moderación de Proyectos (`app/admin/moderation/page.tsx`).
- [ ] **Tarea 6.3**: Gestión de Usuarios e Instituciones (`app/admin/users/page.tsx`).
- [ ] **Tarea 6.4**: Log de Auditoría y Reversión con Motivo (`app/admin/audit-logs/page.tsx`).

### Fase 7: Componentes Reutilizables, Polish UX y Verificación
- [ ] **Tarea 7.1**: Componentes de UI genéricos (`components/data-table.tsx` y `components/confirm-dialog.tsx`).
- [ ] **Tarea 7.2**: Manejo de Estados de Carga (`loading.tsx`) y Errores (`error.tsx`).
- [ ] **Tarea 7.3**: Verificación de compilación final (`tsc --noEmit` y `pnpm build`).

---

## 📜 Historial de Subtareas Ejecutadas

| Tarea | Descripción | Estado | Commit Hash / Mensaje | Fecha |
| :--- | :--- | :---: | :--- | :---: |
| **Tarea 1.1** | Refactorización de `lib/db/schema.ts` (Roles extendidos, skills, objetivos, tipo contribución, audit fields) | ✅ Completado | `feat(db): update schema with extended roles, skills, objectives, contribution types, and audit fields (Tarea 1.1)` | 2026-08-09 |
| **Tarea 1.2** | Actualización de Schemas Zod (`lib/validations.ts`) y Helper de Permisos (`lib/permissions.ts`) | ✅ Completado | `feat(validations): update Zod schemas and permission helpers for extended roles and revert actions (Tarea 1.2)` | 2026-08-09 |
| **Tarea 1.3** | Configuración de Drizzle Kit, generación de SQL migrations y script `db:push` | ✅ Completado | `feat(db): configure drizzle-kit, generate migration SQL files, and add db:push script (Tarea 1.3)` | 2026-08-09 |
| **Tarea 2.1** | Creación de `scripts/seed.ts` con datos demo realistas (usuarios, categorías, instituciones, proyectos) | ✅ Completado | `feat(seed): create scripts/seed.ts with realistic demo data and add db:seed script (Tarea 2.1)` | 2026-08-09 |
| **Tarea 3.1** | Landing Page pública (`app/page.tsx`): hero con gradiente, stats, 6 features, categorías dinámicas desde DB, proyectos recientes, CTA banner y footer | ✅ Completado | `feat(landing): build full landing page with hero, features, categories and recent projects (Tarea 3.1)` | 2026-08-09 |
| **Tarea 3.2** | Catálogo público de proyectos (`app/projects/page.tsx`): buscador debounced, filtros de categoría y universidad, paginación por URL, skeleton loading, estado vacío | ✅ Completado | `feat(projects): add public projects catalog with search, filters and pagination (Tarea 3.2)` | 2026-08-09 |
| **Tarea 3.3** | Vista detallada de proyecto (`app/projects/[slug]/page.tsx`): hero con cover, objetivos, necesidades, equipo, muro de contribuciones aprobadas, modal de solicitud y botón seguir/dejar de seguir | ✅ Completado | `feat(project-detail): add public project detail page with apply modal, follow button and contributions wall (Tarea 3.3)` | 2026-08-09 |
| **Tarea 4.1** | Mejora de Onboarding: selector de rol visual con 5 opciones, chips de habilidades con sugerencias, validación de dominio institucional en vivo (verde/ámbar), counter bio, UI premium | ✅ Completado | `feat(onboarding): rewrite form with extended roles, skills chip input, live domain validation and premium UI (Tarea 4.1)` | 2026-08-09 |
| **Tarea 4.2** | Dashboard expandido: sección Proyectos Seguidos, feed de actividad reciente (notificaciones reales), estado de postulaciones en curso, quick-actions, diseño premium 3 columnas | ✅ Completado | `feat(dashboard): expand with followed projects, application status, activity feed and quick actions (Tarea 4.2)` | 2026-08-09 |
| **Tarea 4.3** | Notificaciones dinámicas: `notifications-menu.tsx` ya conectado a `getMyNotifications()` con polling 15s y mark-as-read real desde la tabla `notifications` | ✅ Completado | (ya implementado — sin commit adicional) | 2026-08-09 |
| **Tarea 5.1** | Formulario de proyecto extendido: campos `objectives` (textarea), `collaborationNeeds` (chip input dinámico), `universityAffiliationId` (selector); persistencia en `createProject` y `updateProject`; `new/page.tsx` y `[id]/page.tsx` cargan `affiliations` | ✅ Completado | `feat(projects): add objectives, collaborationNeeds and affiliation to form and persist in DB (Tarea 5.1)` | 2026-08-09 |
| **Tarea 5.2** | Panel del líder mejorado: badge de tipo por contribución (color-coded), enlace `contentUrl`, flujo de rechazo con textarea de comentario confirmable, avatar + `joinedAt` en miembros, fecha de aplicación formateada | ✅ Completado | `feat(dashboard): enhance project manage tabs with contribution types, reject comment flow, member avatars and formatted dates (Tarea 5.2)` | 2026-08-09 |

