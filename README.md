# Syllo

Syllo es una agenda para estudiantes que centraliza tareas, calificaciones y anuncios de **Google Classroom**, fechas del calendario del **CVG**, notas y eventos personales. Ordena las entregas por vencimiento y evita pedir acceso a la casilla de Gmail.

## Funcionalidad

- **Inicio de sesión con Google**: autenticación mediante cuenta de Google (OAuth) con permisos de **solo lectura** sobre Classroom. Syllo no solicita acceso a Gmail. El `access_token` se renueva automáticamente con el `refresh_token` cuando vence.
- **Importación automática de cursos y tareas**: obtiene los cursos activos del usuario y, para cada uno, el trabajo asignado (`courseWork`) junto con el estado de la entrega del alumno.
- **Dashboard de tareas** con:
  - Listado de cursos en una barra lateral, con contador de tareas pendientes por curso.
  - Tarjetas de resumen: pendientes, vencidas, de la semana y completadas.
  - Pestañas para filtrar tareas por estado (pendientes / empezadas / urgentes / esta semana / completadas).
  - **Estado propio sobre cada tarea**: marcarla como "ya la empecé" y fijarla. Se guarda en Postgres contra el par `courseId`/`courseWorkId` de Classroom, así que sobrevive a que renombres el curso o a que el profesor cambie el título. Las fijadas van arriba de todo en Tareas y en Inicio.
  - Tarjetas de tarea con curso, título, descripción, puntaje, fecha de vencimiento y etiqueta visual según proximidad de la fecha (vencida, vence hoy/mañana, días restantes, entregada).
  - Filtro por curso seleccionado desde la barra lateral.
- **Calificaciones** (`/dashboard/calificaciones`): reúne los trabajos corregidos y las entregas que todavía esperan una nota, con promedio porcentual cuando Classroom informa un puntaje máximo.
- **Novedades** (`/dashboard/novedades`), en su propia sección del sidebar:
  - Lee directamente los anuncios publicados en los cursos de Classroom.
  - Cada usuario puede pegar la URL dinámica de exportación de su CVG; Syllo valida que sea del dominio oficial y la guarda cifrada con AES-GCM.
  - Las próximas fechas del CVG se mezclan con los anuncios sin acceder al correo institucional.
  - Buscador en memoria, filtro por origen y filtro por curso desde la barra lateral.
  - La ruta anterior `/dashboard/correos` redirige a Novedades para conservar enlaces viejos.
- **Landing page** que explica la propuesta de valor de Syllo y permite iniciar sesión con Google para acceder al dashboard, con enlace a la política de privacidad (`/privacidad`).
- **Inicio** (`/dashboard`): resumen del día con mini-calendario del mes, tarjetas de conteo y las últimas tareas, novedades y notas.
- **Notas** (`/dashboard/notas`): CRUD propio sobre Postgres, con curso asociado (respeta el filtro del sidebar y publica su conteo), buscador en memoria sobre título, contenido y curso, y un **editor de texto enriquecido** ([Tiptap](https://tiptap.dev)): la negrita, los títulos y las listas se ven aplicados mientras se escribe, con atajos de teclado (`⌘B`, `⌘I`) y reglas de entrada (escribir `- ` arranca una lista). Se guarda como HTML; las notas anteriores, escritas en markdown, se convierten al abrirlas (`app/app/lib/markdown.ts`) y quedan migradas al guardar.
- **Calendario** (`/dashboard/calendario`): vista mensual con vencimientos de Classroom, fechas importadas del CVG y eventos personales, más vista agenda en mobile. Permite crear, editar y eliminar **eventos personales**.
  - **Calendario suscribible**: una URL con token (`/api/calendario/[token]`) que Google Calendar y Apple Calendar consultan solos cada unas horas, con un recordatorio (`VALARM`) el día anterior a cada entrega. Como esos servidores pegan **sin sesión**, el feed responde con una foto de los vencimientos que el panel deja en la tabla `snapshot_tareas`: no se guarda ninguna credencial de Google. El token se puede regenerar, lo que apaga el link anterior.
  - La descarga de una vez (`/api/tareas/ics`) sigue disponible dentro del mismo modal.
- **Archivar y renombrar cursos**: los cursos archivados salen de todas las vistas y quedan en su propia pestaña; los renombres permiten nombres más cortos. Ambas cosas se guardan en la base y no tocan nada en Google Classroom.

## Stack tecnológico

- **[Next.js](https://nextjs.org)** (v16, App Router) — framework principal, con Server Components, Server Actions y Route Handlers.
- **[React](https://react.dev)** (v19) — UI.
- **[TypeScript](https://www.typescriptlang.org)** — tipado estático.
- **[Tailwind CSS](https://tailwindcss.com)** (v4) — estilos, con modo oscuro.
- **[Tiptap](https://tiptap.dev)** (sobre ProseMirror) — editor enriquecido de las Notas.
- **[Drizzle ORM](https://orm.drizzle.team)** + **Postgres** ([Neon](https://neon.tech)) — persistencia de notas, eventos y preferencias de cursos.
- **[Auth.js](https://authjs.dev)** (NextAuth v5) — autenticación con Google.
- **[motion](https://motion.dev)** y **[lucide-react](https://lucide.dev)** — animaciones e iconografía.

## Estructura del proyecto

El código de la aplicación vive en `app/` (proyecto Next.js independiente), organizado por
funcionalidad (`src/features/`) con una capa de servicios separada de los componentes, siguiendo
Next.js App Router con carpeta `src/`:

- `src/app/` — solo routing: layouts, páginas, `loading`/`error` y route handlers. El panel
  autenticado está bajo el route group `(panel)/dashboard/`, con las seis secciones (Inicio,
  `tareas/`, `calificaciones/`, `novedades/`, `notas/`, `calendario/`) y sus rutas de API en `app/api/`.
- `src/features/` — un directorio por dominio, cada uno con `components/` (UI cliente) y
  `services/` (fetch a Google/DB, server actions, capas puras de tipos y reglas):
  - `tareas/` — Classroom API (`tareas-server.ts`), reglas de urgencia (`tareas-service.ts`), estado propio (empezada/fijada), tipos en `types.ts`.
  - `calificaciones/` — transformación de entregas de Classroom y presentación de notas.
  - `novedades/` — anuncios directos de Classroom y presentación unificada.
  - `cvg/` — validación, cifrado, lectura y parseo del calendario personal del CVG.
  - `notas/` — CRUD de notas, editor Tiptap, conversión markdown/HTML.
  - `calendario/` — eventos personales, feed suscribible por token y generación de `.ics`.
  - `archivados/` — cursos archivados y renombrados.
  - `dashboard/` — shell del panel: sidebar, layout, hook del filtro de cursos
    (`hooks/filtro-cursos.tsx`) y la action de revalidación de cache.
- `src/lib/` — infraestructura compartida entre features: cliente de Postgres (`db.ts`), esquema
  de Drizzle (`schema.ts`), utilidades genéricas (`fechas.ts`, `texto.ts`, `tema.ts`) y el color
  determinístico por curso (`cursos-color.ts`).
- `src/components/ui/` — componentes genéricos sin lógica de dominio (`aviso.tsx`).
- `app/auth.ts` — configuración de NextAuth (proveedor Google, scopes y refresco de token). Queda
  fuera de `src/` por convención de NextAuth.

### Base de datos

Postgres (Neon) con Drizzle. Guarda lo que el usuario crea dentro de Syllo — notas, eventos, cursos archivados, cursos renombrados y el estado propio de las tareas (`estados_tareas`) —, todo identificado por su dirección de correo.

Los anuncios y las tareas no se persisten: se piden a Classroom y se cachean unos minutos. La URL del calendario CVG sí se guarda porque debe actualizarse entre sesiones, pero se cifra antes de insertarla en `calendarios_cvg`. `snapshot_tareas` guarda curso, título, fecha y link de las entregas pendientes para que el feed suscribible responda sin la sesión del usuario.

El esquema se aplica con `npm run db:push` (no `db:migrate`).

## Cómo correr el proyecto

```bash
cd app
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador. Los tests corren con `npm test` (Vitest, sobre las capas puras). Es necesario configurar las variables de entorno (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `AUTH_SECRET` y `DATABASE_URL`) en `app/.env.local` — ver `app/.env.example`.

### Permisos de Google

En Google Cloud Console, el proyecto necesita tener habilitada la API de **Google Classroom** y declarar estos scopes en la pantalla de consentimiento:

| Scope | Para qué |
| --- | --- |
| `classroom.courses.readonly` | Listar los cursos activos |
| `classroom.coursework.me.readonly` | Listar el trabajo asignado |
| `classroom.student-submissions.me.readonly` | Saber el estado de cada entrega |
| `classroom.announcements.readonly` | Leer los anuncios publicados en los cursos |

Las sesiones creadas antes de sumar el permiso de anuncios no lo incluyen. Novedades detecta ese caso y ofrece reconectar con Google. Como Syllo ya no solicita `gmail.readonly`, no entra a la casilla del usuario ni depende del alcance restringido que originaba la evaluación CASA de Gmail.
