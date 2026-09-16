# Syllo

Syllo es una agenda pensada para estudiantes que centraliza las tareas y los correos de todos sus cursos de **Google Classroom** en un solo lugar. Ordena las entregas por fecha de vencimiento y muestra de un vistazo qué está pendiente, qué es urgente y qué ya fue entregado.

## Funcionalidad

- **Inicio de sesión con Google**: autenticación mediante cuenta de Google (OAuth) con permisos de **solo lectura** sobre Classroom y Gmail (no modifica contenido en ninguno de los dos). El `access_token` se renueva automáticamente con el `refresh_token` cuando vence.
- **Importación automática de cursos y tareas**: obtiene los cursos activos del usuario y, para cada uno, el trabajo asignado (`courseWork`) junto con el estado de la entrega del alumno.
- **Dashboard de tareas** con:
  - Listado de cursos en una barra lateral, con contador de tareas pendientes por curso.
  - Tarjetas de resumen: pendientes, vencidas, de la semana y completadas.
  - Pestañas para filtrar tareas por estado (pendientes / empezadas / urgentes / esta semana / completadas).
  - **Estado propio sobre cada tarea**: marcarla como "ya la empecé" y fijarla. Se guarda en Postgres contra el par `courseId`/`courseWorkId` de Classroom, así que sobrevive a que renombres el curso o a que el profesor cambie el título. Las fijadas van arriba de todo en Tareas y en Inicio.
  - Tarjetas de tarea con curso, título, descripción, puntaje, fecha de vencimiento y etiqueta visual según proximidad de la fecha (vencida, vence hoy/mañana, días restantes, entregada).
  - Filtro por curso seleccionado desde la barra lateral.
- **Bandeja de correos de Classroom** (`/dashboard/correos`), en su propia sección del sidebar:
  - Lista solo los mensajes cuyo remitente es del dominio `classroom.google.com`.
  - Buscador con debounce, filtro por curso (desde la barra lateral) y filtro de "solo no leídos" — todos se traducen a una búsqueda de Gmail, así que también alcanzan mensajes que todavía no se cargaron.
  - Cada correo se etiqueta con el curso de Classroom detectado a partir del asunto y el resumen.
  - Paginación incremental ("Cargar más") sobre el `nextPageToken` de Gmail.
  - Panel de lectura con el cuerpo del mensaje renderizado en un `iframe` con `sandbox=""` y una CSP propia: el HTML del correo no ejecuta scripts ni accede a Syllo, y las imágenes remotas quedan bloqueadas hasta que el usuario las pide (para no confirmarle al remitente que abrió el mail).
  - Link para abrir el mensaje original en Gmail.
- **Landing page** que explica la propuesta de valor de Syllo y permite iniciar sesión con Google para acceder al dashboard, con enlace a la política de privacidad (`/privacidad`).
- **Inicio** (`/dashboard`): resumen del día con mini-calendario del mes, tarjetas de conteo y las últimas tareas, correos y notas.
- **Notas** (`/dashboard/notas`): CRUD propio sobre Postgres, con curso asociado (respeta el filtro del sidebar y publica su conteo), buscador en memoria sobre título, contenido y curso, y un **editor de texto enriquecido** ([Tiptap](https://tiptap.dev)): la negrita, los títulos y las listas se ven aplicados mientras se escribe, con atajos de teclado (`⌘B`, `⌘I`) y reglas de entrada (escribir `- ` arranca una lista). Se guarda como HTML; las notas anteriores, escritas en markdown, se convierten al abrirlas (`app/app/lib/markdown.ts`) y quedan migradas al guardar.
- **Calendario** (`/dashboard/calendario`): vista mensual con los vencimientos de Classroom coloreados por curso y vista agenda en mobile. Permite crear, editar y eliminar **eventos personales**.
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
  autenticado está bajo el route group `(panel)/dashboard/`, con las cinco secciones (Inicio,
  `tareas/`, `correos/`, `notas/`, `calendario/`) y sus rutas de API en `app/api/`.
- `src/features/` — un directorio por dominio, cada uno con `components/` (UI cliente) y
  `services/` (fetch a Google/DB, server actions, capas puras de tipos y reglas):
  - `tareas/` — Classroom API (`tareas-server.ts`), reglas de urgencia (`tareas-service.ts`),
    estado propio (empezada/fijada), tipos en `types.ts`.
  - `correos/` — bandeja de Gmail (Classroom + CVG).
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

Los correos nunca se persisten, y de las tareas tampoco se guarda el contenido: se piden a Google en el momento y se cachean unos minutos. La única excepción es `snapshot_tareas`, que guarda curso, título, fecha y link de las entregas pendientes porque el feed de calendario tiene que poder responderle a Google sin la sesión del usuario. La alternativa era guardar el `refresh_token` de Google, que habilita todos los scopes concedidos (`gmail.readonly` incluido).

El esquema se aplica con `npm run db:push` (no `db:migrate`).

## Cómo correr el proyecto

```bash
cd app
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador. Los tests corren con `npm test` (Vitest, sobre las capas puras). Es necesario configurar las variables de entorno (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `AUTH_SECRET` y `DATABASE_URL`) en `app/.env.local` — ver `app/.env.example`.

### Permisos de Google

En Google Cloud Console, el proyecto necesita tener habilitadas las APIs de **Google Classroom** y **Gmail**, y declarar estos scopes en la pantalla de consentimiento:

| Scope | Para qué |
| --- | --- |
| `classroom.courses.readonly` | Listar los cursos activos |
| `classroom.coursework.me.readonly` | Listar el trabajo asignado |
| `classroom.student-submissions.me.readonly` | Saber el estado de cada entrega |
| `gmail.readonly` | Leer los correos que Classroom le manda al alumno |

`gmail.readonly` es un scope **restringido** de Google: mientras la app esté en modo *Testing* funciona con los usuarios de prueba que agregues, pero para publicarla hace falta pasar la verificación de Google, que exige una política de privacidad publicada (servida en `/privacidad`) y una evaluación de seguridad CASA.

Las sesiones abiertas antes de sumar el scope de Gmail no tienen ese permiso: la página de correos lo detecta y ofrece reconectar con Google.
