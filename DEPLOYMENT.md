# GUÍA DE DESPLIEGUE Y RE-DESPLIEGUE (DEPLOYMENT.md)

Esta guía detalla el procedimiento paso a paso para desplegar la plataforma de proyectos colaborativos universitarios desde cero, así como las consideraciones críticas al realizar un re-despliegue desde la plataforma v0 de Vercel.

---

## 🔑 Variables de Entorno Requeridas

Antes de cualquier despliegue, asegúrate de configurar las siguientes variables de entorno:

| Variable | Descripción | Ejemplo / Valor |
| :--- | :--- | :--- |
| `DATABASE_URL` | URI de conexión a la base de datos Neon PostgreSQL. | `postgres://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `BETTER_AUTH_SECRET` | Llave secreta aleatoria para la firma de sesiones y tokens. | Cadena aleatoria de 32+ caracteres (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | URL base pública de la aplicación. | `https://tu-proyecto.vercel.app` o `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | URL pública utilizada por el cliente (opcional). | `https://tu-proyecto.vercel.app` |

---

## 🚀 OPCIÓN 1: Despliegue Desde Cero (Fresh Deployment)

Sigue estos pasos si estás configurando la aplicación en una nueva cuenta de Vercel o en un servidor propio:

### Paso 1: Clonar e Instalar Dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd university-collaboration-platform
pnpm install
```

### Paso 2: Crear la Base de Datos en Neon
1. Ingresa a [Neon.tech](https://neon.tech) y crea un nuevo proyecto PostgreSQL.
2. Copia la `DATABASE_URL` de conexión directa/pooled.

### Paso 3: Configurar Archivo `.env.local`
Crea el archivo `.env.local` en la raíz del proyecto:
```env
DATABASE_URL="postgres://usuario:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
BETTER_AUTH_SECRET="tu_secreto_super_seguro_generado_aqui"
BETTER_AUTH_URL="http://localhost:3000"
```

### Paso 4: Sincronizar el Esquema en Neon PostgreSQL
Ejecuta Drizzle Kit para crear las 17 tablas y relaciones en Neon:
```bash
pnpm db:push
```

### Paso 5: Poblar la Base de Datos con Datos Iniciales (Seed)
Una vez que las tablas existan en Neon, puebla la base de datos con instituciones, categorías y usuarios de demostración:
```bash
pnpm db:seed
# O alternativamente:
npx tsx scripts/seed.ts
```

### Paso 6: Desplegar en Vercel
1. Conecta el repositorio de GitHub/GitLab con Vercel.
2. Agrega las variables de entorno (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`) en las configuraciones del proyecto en Vercel (`Settings -> Environment Variables`).
3. Despliega el proyecto.

---

## 🔄 OPCIÓN 2: Re-Despliegue y Sincronización desde v0 (Existing v0 Project)

> ⚠️ **¡WARNING IMPORTANTE!**
> 
> La plataforma **v0 de Vercel** recompila y actualiza automáticamente el código frontend y las Server Actions al presionar *Deploy*, **PERO NO EJECUTA AUTOMÁTICAMENTE LAS MIGRACIONES DE DRIZZLE NI LOS SCRIPTS DE SEED EN NEON POSTGRESQL**.
>
> Si realizas cambios en el esquema (`lib/db/schema.ts`) o requieres cargar datos de prueba, debes sincronizar manualmente la base de datos Neon desde tu terminal local o entorno CLI antes de probar la app en v0.

### Pasos para Re-Desplegar con v0 cuando hay cambios de Schema o Seed:

1. **Obtener la String de Conexión de Neon**:
   Obtén la `DATABASE_URL` vinculada a tu proyecto v0 (la puedes consultar en la pestaña de Integraciones de Vercel/Neon o en tus variables de proyecto).

2. **Sincronizar Estructura de Tablas (Push de Drizzle)**:
   Desde tu terminal local con el código actualizado, ejecuta:
   ```bash
   DATABASE_URL="postgres://tu_conexion_neon..." pnpm db:push
   ```
   *Esto aplicará todas las migraciones DDL pendientes (nuevas columnas, roles, enums y tablas).*

3. **Ejecutar o Re-poblar Datos Demostrativos (Seed)**:
   ```bash
   DATABASE_URL="postgres://tu_conexion_neon..." pnpm db:seed
   ```

4. **Verificar las Variables de Entorno en v0**:
   Asegúrate de que en la consola de v0 / Vercel las siguientes variables estén presentes:
   * `DATABASE_URL`
   * `BETTER_AUTH_SECRET`
   * `BETTER_AUTH_URL` (Debe apuntar al dominio público generado por v0 o Vercel Preview).

---

## 🛠️ Solución de Problemas Frecuentes (Troubleshooting)

### 1. Error de Autenticación / Cookie en el iframe de Vista Previa de v0
Si la sesión no se guarda dentro del iframe de v0 preview, verifica que `lib/auth.ts` mantenga la configuración de cookies seguras para desarrollo:
```typescript
advanced: {
  defaultCookieAttributes: {
    sameSite: 'none',
    secure: true,
  },
}
```

### 2. Error de Enums / Tipos Incompatibles al cambiar Roles
Si al actualizar roles en `profiles` la base de datos rechaza registros antiguos, ejecuta `pnpm db:push` aceptando la migración/truncado si estás en desarrollo.

### 3. Error `Cannot find module 'drizzle-kit'`
Asegúrate de ejecutar las tareas con `pnpm` o con `node node_modules/typescript/bin/tsc --noEmit` para garantizar la resolución local de paquetes instalados.
