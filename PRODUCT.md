# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Estudiantes universitarios que cursan materias con Google Classroom y además
reciben comunicación por el correo de su universidad (campus virtual / CVG). Uso
típico: entre clases o de noche, con varias pestañas abiertas (Classroom, mail
institucional, campus), tratando de no perderse una entrega ni un aviso. Los
autores son dos estudiantes construyendo la herramienta para sí mismos y sus
compañeros.

## Product Purpose

Syllo reúne en un solo panel la información dispersa de la cursada: los correos
de Google Classroom, los correos de la universidad, y las tareas de todos los
cursos ordenadas por fecha de entrega con su estado (pendiente, urgente,
entregada, vencida). Éxito = el estudiante abre una sola app en vez de tres o
cuatro y no se le pasa nada importante.

## Positioning

Un único lugar para toda la vida académica del estudiante, no solo las tareas:
reúne correos de Classroom + correos de la universidad + tareas + notas +
calendario, con recordatorios en el calendario del celular. Acceso de solo
Google: nunca modifica ni envía nada en nombre del usuario.

## Operating Context

- Login con cuenta de Google (institucional). OAuth con scopes de solo lectura de
  Classroom y de correo.
- El panel autenticado vive bajo el route group `(panel)`, con cinco secciones:
  Inicio, Tareas, Correos, Notas y Calendario.
- Tareas: tabs de pendientes, empezadas, esta semana, urgentes, vencidas
  (limitado a los últimos 30 días), completadas y archivados; vista cuadrícula o
  lista; buscador en memoria; tarjetas de resumen que abren su pestaña.
- Sobre cada tarea de Classroom el alumno puede marcar "ya la empecé" y fijarla;
  las fijadas encabezan la lista en Tareas y en Inicio. Es estado propio de
  Syllo: no toca nada en Google.
- Los cursos se pueden archivar y renombrar; ambas cosas se persisten en
  Postgres y se respetan en todas las secciones.
- Navegación optimizada con cache de las llamadas a Google y una acción de
  refrescar datos sin salir de la app.
- Dark mode con toggle. El tema se aplica solo durante la sesión actual: no se
  persiste, así que Syllo arranca siempre en claro.
- Postgres (Neon) + Drizzle guardan lo que el usuario crea dentro de Syllo:
  notas (con su curso), eventos, cursos archivados y renombrados, y el estado
  propio de las tareas. Los correos nunca se persisten y de las tareas no se
  guarda el contenido: se piden a Google y se cachean unos minutos. La
  excepción es la foto de vencimientos que alimenta el calendario suscribible
  (curso, título, fecha y link de lo pendiente), porque Google consulta ese
  feed sin la sesión del usuario.

## Capabilities and Constraints

- Hoy: agregación de correos de Classroom y de la universidad; tareas de todos
  los cursos ordenadas por entrega y estado, con estado propio del alumno
  (empezada, fijada); notas propias con curso, buscador y editor enriquecido,
  donde el formato se aplica mientras se escribe (crear, editar, borrar);
  calendario mensual con los vencimientos y eventos personales; calendario
  suscribible por URL, con recordatorio el día anterior a cada entrega, más la
  descarga suelta a `.ics`.
- Los recordatorios existen a través del calendario suscribible: los da el
  celular del alumno, no una notificación propia de Syllo. Se comunican así, sin
  prometer avisos dentro de la app.
- Idioma: español rioplatense ("vos").
- Stack: Next.js (versión con breaking changes propios — ver `app/AGENTS.md`),
  Tailwind CSS v4, Auth.js, Drizzle + Postgres (Neon), Tiptap, motion,
  lucide-react, fuente Poppins, Vitest para las capas puras.
- Publicar la app requiere la verificación de Google: `gmail.readonly` es un
  scope restringido y exige política de privacidad publicada (`/privacidad`) más
  una evaluación de seguridad CASA.

## Brand Commitments

- Nombre: **Syllo**.
- Voz: cercana, directa, en "vos"; sin hype ni jerga de marketing.
- Sin logo formal todavía. El color de acento actual es indigo, pero no es un
  compromiso fijo.

## Evidence on Hand

- App funcional con las cinco secciones del panel ya construidas.
- Tests de las capas puras con Vitest (`npm test` en `app/`).
- No hay métricas de uso, testimonios, clientes, precios ni benchmarks — no se
  deben fabricar.

## Product Principles

1. Un solo lugar: reducir el malabarismo de pestañas del estudiante.
2. Solo lectura y transparente: Syllo muestra, nunca toca ni manda.
3. Honestidad sobre el alcance: lo disponible hoy se distingue de lo que viene.
4. Crecer sin volverse un caos: cada sección nueva (notas, recordatorios,
   calendario) entra en el mismo panel ordenado.
5. Hecho por estudiantes para estudiantes: lenguaje y prioridades del que cursa.
