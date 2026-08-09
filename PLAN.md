# PLAN DE IMPLEMENTACIÓN MVP: Plataforma de Proyectos Colaborativos Universitarios

Este documento presenta una auditoría técnica completa del estado actual de la aplicación y un plan de acción detallado paso a paso para completar el producto mínimo viable (MVP) de la plataforma de colaboración interdisciplinaria universitaria.

---

## 1. Resumen del Estado Actual (Architecture & Tech Stack)

La arquitectura de la solución se basa en una pila moderna de desarrollo web full-stack basada en React 19 y Next.js 15/16 (App Router):

* **Framework Base**: Next.js 16.3.0 (App Router, Server Actions, React Server Components).
* **Lenguaje**: TypeScript 5.7.3.
* **Autenticación**: Better Auth (`better-auth` v1.6.26) utilizando la estrategia de Email/Password enlazada directamente con PostgreSQL.
* **Base de Datos y ORM**: Neon PostgreSQL integrado mediante la librería `pg` y el ORM Drizzle (`drizzle-orm` ^0.45.2) en modo `pool`.
* **Diseño y UI**: Tailwind CSS v4, componentes UI basados en Radix UI / Base UI (`components/ui/*`), iconos con `lucide-react`, soporte para tema claro/oscuro con `next-themes` y notificaciones tipo toast con `sonner`.
* **Validación**: Schemas estrictos con Zod (`zod` v4.4.3).

---

## 2. Módulos Implementados vs. Incompletos (Audit Técnico)

| Módulo / Componente | Estado Actual | Diagnóstico y Deficiencias Identificadas |
| :--- | :--- | :--- |
| **Esquema de Base de Datos (`lib/db/schema.ts`)** | Parcial (17 tablas) | Falta alinear con los requerimientos del negocio:<br>- `profiles`: El enum `role` solo posee `student`, `faculty`, `admin` (faltan `project_leader`, `collaborator`, `moderator`, `external_expert`). Faltan campos `skills` (jsonb/array) y `institutionalEmail`.<br>- `projects`: Faltan campos `objectives`, `collaborationNeeds` y `affiliationId`.<br>- `contributions`: Falta la columna `type` (`update`, `milestone`, `resource`, `report`).<br>- `auditLogs`: Faltan campos `reason` y `previousData` (jsonb) para soportar la reversión administrativa.<br>- `universityAffiliations`: Falta campo `type` (`university` vs `company`). |
| **Autenticación y Onboarding** | Funcional (Básico) | La autenticación email/password funciona mediante Better Auth. En onboarding (`components/onboarding-form.tsx`) falta la selección de habilidades (`skills`), intereses y rol extendido. |
| **Landing Page Pública (`app/page.tsx`)** | **Incompleto / Placeholder** | La página de inicio actual contiene un logo SVG temporal con el texto *"Your v0 generation will show here."*. No presenta la propuesta de valor ni enlace directo al catálogo público. |
| **Catálogo Público de Proyectos (`app/projects/`)** | **Inexistente** | No existen las rutas `app/projects/page.tsx` ni `app/projects/[slug]/page.tsx`. Los usuarios anónimos o autenticados no pueden explorar, filtrar por categoría/universidad ni postularse a proyectos desde la vista pública. |
| **Panel de Usuario (`app/dashboard/`)** | Parcialmente Implementado | Existen las vistas `overview`, `my projects`, `applications` y `contributions`. Sin embargo:<br>- Falta la vista/sección de Proyectos Seguidos (`projectSubscriptions`).<br>- El menú de notificaciones (`components/notifications-menu.tsx`) maneja datos de demostración estáticos en lugar de consultar la base de datos. |
| **Panel Admin y Moderación (`app/admin/`)** | **Inexistente** | No existen las rutas `app/admin/page.tsx`, `app/admin/moderation/page.tsx`, `app/admin/users/page.tsx` ni `app/admin/audit-logs/page.tsx`. La lógica de Server Actions de administración en `app/actions/admin.ts` carece de interfaz gráfica. |
| **Server Actions (`app/actions/`)** | Parcial | Se implementaron acciones para proyectos, postulaciones y contribuciones básicas, pero faltan:<br>- Acciones para suscripciones (`subscribeToProject`, `unsubscribeFromProject`).<br>- Edición/retiro de contribuciones antes de aprobación.<br>- Reversión de registros en auditoría por el administrador (`revertAuditLog`). |
| **Script de Poblado de Datos (`scripts/seed.ts`)** | **Inexistente** | No hay script para poblar la base de datos en Neon Postgres con instituciones, usuarios demo, categorías y proyectos iniciales. |
| **Componentes de UI Comunes** | Parcial | Faltan `components/data-table.tsx` (tabla genérica paginada para admin) y `components/confirm-dialog.tsx` (diálogo de confirmación para acciones destructivas/moderación). |

---

## 3. Roadmap de Implementación Paso a Paso

### Fase 1: Actualización del Modelo de Datos y Permisos

* [ ] **Tarea 1.1: Refactorización de `lib/db/schema.ts`**
  * Agregar el enum de roles ampliado a `profiles`: `"student" | "project_leader" | "collaborator" | "moderator" | "admin" | "external_expert"`.
  * Agregar los campos `skills` (jsonb/text) e `institutionalEmail` (text) a `profiles`.
  * Agregar `type` (`"university" | "company"`) a `universityAffiliations`.
  * Agregar `objectives` (text), `collaborationNeeds` (jsonb) y `affiliationId` (text FK a `universityAffiliations`) a `projects`.
  * Agregar `type` (`"update" | "milestone" | "resource" | "report"`) a `contributions`.
  * Agregar `reason` (text) y `previousData` (jsonb) a `auditLogs`.

* [ ] **Tarea 1.2: Actualización de Schemas Zod y Helper de Permisos**
  * Actualizar `lib/validations.ts` con las nuevas enumeraciones y campos (habilidades, objetivos, tipo de contribución, razón de reversión).
  * Actualizar `lib/permissions.ts` agregando funciones helper: `isModerator`, `isAdmin`, `canApproveContribution`, `isProjectLeaderOrManager`.

* [ ] **Tarea 1.3: Sincronización del Esquema de Base de Datos**
  * Ejecutar `npx drizzle-kit push` o la migración correspondiente para aplicar los cambios a la base de datos Neon PostgreSQL.

---

### Fase 2: Script de Poblamiento de Datos (Seed Script)

* [ ] **Tarea 2.1: Creación de `scripts/seed.ts`**
  * Escribir un script ejecutable (`npx tsx scripts/seed.ts`) que inserte:
    * 3 Afiliaciones Universitarias/Empresarial (ej. Universidad Nacional, Universidad de los Andes, Tech Expert Org).
    * 6 Categorías / Áreas de conocimiento (ej. Inteligencia Artificial, Biotecnología, Sostenibilidad, FinTech, Educación, Robótica).
    * 6 Usuarios en Better Auth con sus respectivos `profiles` (Estudiante, Líder, Colaborador, Moderador, Admin, Experto Externo).
    * 8 Proyectos de prueba en diversos estados (`draft`, `pending_review`, `published`, `archived`).
    * Aplicaciones de colaboración, miembros asignados, contribuciones con distintas etapas de revisión y logs de auditoría iniciales.

---

### Fase 3: Experiencia Pública y Descubrimiento (Landing & Catálogo)

* [ ] **Tarea 3.1: Construcción de la Landing Page (`app/page.tsx`)**
  * Diseñar una portada moderna con hero section, llamado a la acción para registro/inicio de sesión, ventajas de la plataforma interdisciplinaria, categorías destacadas y muestra de proyectos recientes.

* [ ] **Tarea 3.2: Catálogo Público de Proyectos (`app/projects/page.tsx`)**
  * Crear la página de exploración con:
    * Buscador en tiempo real por título, descripción o habilidades requeridas.
    * Filtros laterales/superiores por categoría, estado y universidad de origen.
    * Paginación y estados de carga (skeletons) y vacíos (`EmptyState`).

* [ ] **Tarea 3.3: Vista Detallada de Proyecto (`app/projects/[slug]/page.tsx`)**
  * Desarrollar la página pública del proyecto con:
    * Encabezado con título, categoría, estado y líder del proyecto.
    * Objetivos y necesidades de colaboración expresadas claramente.
    * Lista de miembros actuales y sus roles.
    * Muro de contribuciones y avances aprobados.
    * Botón dinámico de postulación a colaborador (abre modal con `message`).
    * Botón de Seguir / Dejar de seguir proyecto (`projectSubscriptions`).

---

### Fase 4: Onboarding y Panel de Usuario (Dashboard)

* [ ] **Tarea 4.1: Mejora del Flujo de Onboarding (`app/onboarding/page.tsx`)**
  * Actualizar `components/onboarding-form.tsx` para solicitar rol, bio, habilidades (tags/chips) e institución académica.
  * Ejecutar la validación del dominio del correo institucional asignando el estado `verified` o `pending`.

* [ ] **Tarea 4.2: Expansión del Dashboard (`app/dashboard/page.tsx`)**
  * Agregar la pestaña/sección de "Proyectos Seguidos".
  * Integrar resumen de actividad reciente y estado de postulaciones en curso.

* [ ] **Tarea 4.3: Lógica Dinámica de Notificaciones**
  * Conectar `components/notifications-menu.tsx` a un Server Action para leer y marcar notificaciones reales desde la tabla `notifications`.

---

### Fase 5: Gestión de Proyectos, Colaboradores y Contribuciones

* [ ] **Tarea 5.1: Formulario de Creación/Edición de Proyecto**
  * Actualizar `components/project-form.tsx` y `app/dashboard/projects/new/page.tsx` para incluir la definición de objetivos, áreas del conocimiento y necesidades del equipo.

* [ ] **Tarea 5.2: Panel de Control del Líder (`app/dashboard/projects/[id]/page.tsx`)**
  * Refactorizar `components/project-manage-tabs.tsx`:
    * Pestaña de Postulaciones: Aprobar/rechazar postulaciones de estudiantes con creación automática del registro en `projectMembers`.
    * Pestaña de Miembros: Promover/demover roles dentro del proyecto o remover miembros activos.
    * Pestaña de Contribuciones: Revisar entregables o actualizaciones de miembros y aprobar/rechazar con comentario.

* [ ] **Tarea 5.3: Formulario de Contribuciones y Edición/Retiro**
  * Extender `components/new-contribution-dialog.tsx` para seleccionar el tipo de contribución (`update`, `milestone`, `resource`, `report`).
  * Implementar la posibilidad de que el autor edite o retire su contribución mientras permanezca en estado `submitted`.

---

### Fase 6: Módulo de Administración, Moderación y Auditoría

* [ ] **Tarea 6.1: Layout del Panel de Administración (`app/admin/layout.tsx`)**
  * Proteger el área administrativa garantizando acceso exclusivo a usuarios con rol `admin` o `moderator`.

* [ ] **Tarea 6.2: Cola de Moderación de Proyectos (`app/admin/moderation/page.tsx`)**
  * Crear la interfaz de revisión para que los moderadores examinen proyectos en estado `pending_review`, aprueben su publicación o los rechacen con comentarios de retroalimentación.

* [ ] **Tarea 6.3: Gestión de Usuarios e Instituciones (`app/admin/users/page.tsx`)**
  * Crear tabla interactiva para buscar usuarios, modificar sus roles globales y aprobar/rechazar manualmente verificaciones institucionales pendientes.

* [ ] **Tarea 6.4: Log de Auditoría y Reversión de Cambios (`app/admin/audit-logs/page.tsx`)**
  * Implementar tabla de registros de auditoría (`auditLogs`).
  * Agregar la acción administrativa para revertir o eliminar registros inválidos restaurando la entidad a partir del `previousData` guardado y requiriendo un motivo expreso (`reason`).

---

### Fase 7: Componentes Reutilizables, Polish UX y Verificación

* [ ] **Tarea 7.1: Componentes Globales de UI**
  * Implementar `components/data-table.tsx` con soporte de ordenamiento y paginación.
  * Implementar `components/confirm-dialog.tsx` para diálogos modales de confirmación.

* [ ] **Tarea 7.2: Estados de Carga y Manejo de Errores**
  * Crear `loading.tsx` y `error.tsx` en los segmentos clave (`app/projects/`, `app/dashboard/`, `app/admin/`).

* [ ] **Tarea 7.3: Control de Calidad y Pruebas**
  * Verificar cero errores de compilación TypeScript mediante `./node_modules/.bin/tsc --noEmit`.
  * Probar el build de producción mediante `pnpm build`.

---

## 4. Especificación de Interfaces y APIs

### 4.1. Definición de Schemas Zod (`lib/validations.ts`)

```typescript
// Roles extendidos
export const roleValues = [
  "student",
  "project_leader",
  "collaborator",
  "moderator",
  "admin",
  "external_expert",
] as const

export const contributionTypeValues = [
  "update",
  "milestone",
  "resource",
  "report",
] as const

// Creación de proyecto
export const createProjectSchema = z.object({
  title: z.string().min(4).max(120),
  summary: z.string().min(10).max(280),
  description: z.string().min(30).max(8000),
  objectives: z.string().min(20).max(3000),
  categoryId: z.string().min(1),
  universityAffiliationId: z.string().optional(),
  collaborationNeeds: z.array(z.string()).default([]),
  visibility: z.enum(["public", "university_only"]).default("public"),
  maxMembers: z.coerce.number().int().min(1).max(50).default(6),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
})

// Reversión por administrador
export const revertAuditSchema = z.object({
  auditLogId: z.string().min(1),
  reason: z.string().min(5, "Debe proporcionar una razón para la reversión").max(500),
})
```

### 4.2. Contrato de Server Actions (`app/actions/`)

Todas las Server Actions retornarán un tipo discriminado para manejo de errores en el cliente:

```typescript
export type ActionResult<T = undefined> = 
  | { success: true; data?: T }
  | { success: false; error: string }
```

Firmas clave requeridas:

1. `subscribeToProject(projectId: string): Promise<ActionResult>`
2. `unsubscribeFromProject(projectId: string): Promise<ActionResult>`
3. `revertAuditEntry(input: unknown): Promise<ActionResult>`
4. `updateContribution(input: unknown): Promise<ActionResult>`
5. `getNotifications(): Promise<Notification[]>`

---

## 5. Convenciones de Código y Contexto para Desarrollo

Para asegurar que cualquier agente o desarrollador pueda tomar cada tarea del roadmap de manera independiente sin romper el contexto:

1. **Uso de Server Actions**:
   * Todas las mutaciones deben residir en `app/actions/*.ts` marcadas con `"use server"`.
   * Todo Server Action debe autenticar la sesión mediante `getUserId()` o `getCurrentUserWithProfile()` de `lib/permissions.ts` antes de realizar operaciones de base de datos.

2. **Acceso a Base de Datos con Drizzle**:
   * Utilizar la instancia centralizada `db` exportada desde `@/lib/db`.
   * Emplear consultas tipadas en `lib/queries.ts` para lecturas complejas de servidor.

3. **Manejo de Errores y UI Feedback**:
   * Las mutaciones en formularios deben utilizar componentes de `shadcn/ui` y notificaciones `toast.success()` / `toast.error()` de `sonner`.

4. **Estilos y Componentes UI**:
   * Utilizar únicamente las clases utilitarias de Tailwind CSS v4 integradas con las variables CSS del sistema de temas.
   * Respetar las variantes de `components/ui/button.tsx` y el renderizado con prop `render` de los primitivos.

5. **Registro de Auditoría (`auditLogs`)**:
   * Toda acción que modifique el estado de un recurso principal (proyectos, postulaciones, contribuciones, perfiles) debe invocar a `logAudit()` en `lib/audit.ts` almacenando el `actorId`, `action`, `entityType`, `entityId` y el estado previo en `previousData` cuando aplique.

---

## 6. Reglas de Ejecución para Agentes (Workflow & Commit Strategy)

Para mantener la estabilidad de los deploys automáticos y evitar desbordamiento de contexto o costos innecesarios, **todo agente que trabaje en este repositorio debe cumplir strictly con el siguiente protocolo:**

1. **Regla de Ejecución Atómica (Strict Scope):**
   * El agente debe tomar **ÚNICAMENTE UNA SUBTAREA A LA VEZ** (por ejemplo: "Tarea 1.1" o "Tarea 3.2").
   * Queda estrictamente prohibido avanzar a la siguiente tarea sin la confirmación explícita del usuario.

2. **Verificación Pre-Commit:**
   * Antes de dar por finalizada la subtarea, el agente debe verificar que no haya errores de compilación ejecutando:
     `npx tsc --noEmit`
   * Si el comando arroja errores de tipos o sintaxis, deben corregirse antes de proceder.

3. **Actualización del Archivo de Estado (`PROGRESS.md`):**
   * Tras completar la subtarea y verificar la compilación, el agente debe actualizar obligatoriamente el archivo `PROGRESS.md`:
     * Marcar la casilla de la subtarea como completada (`[x]`).
     * Actualizar los campos **Fase Activa**, **Siguiente Subtarea Pendiente**, **Progreso General** y **Último Commit**.
     * Registrar una fila en la tabla *Historial de Subtareas Ejecutadas* indicando la tarea, estado, hash/mensaje de commit y fecha.

4. **Protocolo de Cierre y Commit:**
   * Una vez completada la subtarea, verificados los tipos y actualizado `PROGRESS.md`, el agente debe realizar el commit correspondiente en Git.
   * El mensaje de commit debe seguir el formato Conventional Commits e incluir la referencia a la tarea del `PLAN.md`:
     * Ejemplo: `feat(db): update schema with extended roles and audit fields (Tarea 1.1)`
   * Para aspectos relativos al despliegue en Vercel/v0 y sincronización de base de datos Neon, consultar [DEPLOYMENT.md].
   * Tras hacer el commit (y el push si tiene permisos), **el agente DEBE FRENAR SU EJECUCIÓN** y entregar el control al usuario indicando el comando o prompt recomendado para la siguiente subtarea.

