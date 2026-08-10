# UniCollab — Plataforma de Colaboración Universitaria

Plataforma colaborativa para la gestión y descubrimiento de proyectos de investigación entre universidades, investigadores y estudiantes.

**Demo en vivo:** https://demo-uni-collaboration-platform.vercel.app

---

## ✨ Características

### Experiencia Pública
- **Landing Page** — Presentación del plataforma con propuesta de valor
- **Catálogo de Proyectos** — Exploración y búsqueda de proyectos disponibles
- **Vista detalle de Proyecto** — Información completa, requisitos ycalled para colaborar

### Autenticación y Onboarding
- Registro e inicio de sesión con email/contraseña
- Flujo de onboarding con perfil de usuario (skills, intereses, intereses de colaboración)

### Dashboard de Usuario
- Vista personalizada de proyectos creados y en los que colabora
- Notificaciones en tiempo real
- Gestión de contribuciones propias

### Gestión de Proyectos
- Creación y edición de proyectos (líder)
- Definición de objetivos, necesidades de colaboración y tipo de contribución
- Postulación de colaboradores con carta de motivación
- Aprobación/rechazo de postulaciones por parte del líder
- Historial de contribuciones

### Módulo de Administración
- **Moderación** — Revisión y aprobación de nuevos proyectos
- **Gestión de Usuarios e Instituciones** — CRUD completo
- **Log de Auditoría** — Registro de acciones sensibles con timestamps y usuario responsable
- **Reversión de Acciones** — Capacidad de deshacer operaciones críticas

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (React 19, App Router) |
| Lenguaje | TypeScript |
| ORM | Drizzle ORM |
| Base de datos | PostgreSQL |
| Autenticación | Better Auth |
| Validaciones | Zod |
| CSS / UI | Tailwind CSS 4, Shadcn/ui, Base UI, Radix |
| Estado | SWR |
| Notificaciones | Sonner (toasts) |
| Íconos | Lucide React |
| Despliegue | Vercel |
| Package Manager | pnpm |

---

## 📁 Estructura del Proyecto

```
app/                    # App Router (Next.js 13+)
  actions/              # Server Actions
  admin/                # Panel de administración
    audit-logs/         # Log de auditoría
    moderation/         # Moderación de proyectos
    users/             # Gestión de usuarios
  api/                  # Rutas API
  dashboard/           # Panel del usuario
  onboarding/          # Flujo de onboarding
  projects/            # Catálogo y detalle de proyectos
  sign-in/             # Página de inicio de sesión
  sign-up/             # Página de registro
components/
  ui/                  # Componentes base (shadcn)
  *.tsx                # Componentes específicos del dominio
drizzle/
  0000_tranquil_bullseye.sql  # Migración SQL
  meta/                # Metadatos de migraciones
lib/
  db/
    schema.ts          # Esquema de base de datos (Drizzle)
    index.ts           # Cliente de base de datos
  permissions.ts       # Helper de permisos por rol
  validations.ts       # Schemas Zod para validación
scripts/
  seed.ts              # Script de poblamiento con datos demo
public/                # Archivos estáticos
```

---

## 🚀 Primeros Pasos

### Requisitos Previos

- Node.js 22+
- pnpm 9+
- PostgreSQL (local o en la nube)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/JDBorjaC/demo-uni-collaboration-platform.git
cd demo-uni-collaboration-platform

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de la base de datos y secretos

# Aplicar migraciones
pnpm db:push

# Poblar con datos de demostración
pnpm db:seed

# Iniciar en desarrollo
pnpm dev
```

### Variables de Entorno

```env
DATABASE_URL=postgresql://usuario:contraseña@host:5432/nombre_db
BETTER_AUTH_SECRET=tu_secreto_aqui
BETTER_AUTH_URL=http://localhost:3000
```

---

## 📊 Modelo de Datos

El esquema incluye las siguientes entidades principales:

- **Users** — Usuarios con roles (estudiante, investigador, líder, admin)
- **Institutions** — Instituciones/universidades
- **Categories** — Categorías de proyectos
- **Projects** — Proyectos de colaboración con objetivos y necesidades
- **Applications** — Postulaciones de colaboradores
- **Contributions** — Contribuciones de usuarios a proyectos
- **Notifications** — Notificaciones en tiempo real
- **AuditLogs** — Log de auditoría para acciones administrativas

---

## 🔐 Roles y Permisos

| Rol | Descripción |
|---|---|
| `estudiante` | Puede explorar proyectos, postulaciones y contribuir |
| `investigador` | Además de estudiante, puede crear y liderar proyectos |
| `líder` | Investigador con autoridad completa sobre sus proyectos |
| `admin` | Acceso total a moderación, usuarios y auditoría |

---

## 📜 Historial de Desarrollo

El proyecto fue desarrollado siguiendo una metodología de fases incremental documentada en `PROGRESS.md`. Todas las fases (1–7) y sus tareas asociadas han sido completadas.

---

## 👥 Autores

Desarrollado por estudiantes de la Universidad del Norte como parte de un proyecto de colaboración académica.

## 📄 Licencia

Privado — Todos los derechos reservados
