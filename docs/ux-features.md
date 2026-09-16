# 🎨 Auditoría de UX/UI y Catálogo de Features — Syllo

> **Producto:** Syllo (Plataforma de organización académica para estudiantes universitarios)  
> **Integraciones:** Google Classroom API & Gmail API (Classroom + CVG UTN FRRo)  
> **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS, Lucide Icons, NextAuth v5  
> **Fecha:** Septiembre 2026  
> **Objetivo:** Evaluar la experiencia de usuario actual, detectar puntos de fricción cognitivos y ergonómicos, y diseñar un catálogo de mejoras ejecutables orientadas al estudiante universitario.

---

## 📊 1. Resumen Ejecutivo y Diagnóstico General

Syllo resuelve un problema real y doloroso para el estudiante: **la fragmentación de la información académica** entre plataformas (Classroom y el Campus Virtual Moodle de UTN FRRo) y la ansiedad por los plazos de entrega.

### Evaluación por Dimensiones (Escala 1 a 10)

| Dimensión | Puntuación | Estado | Diagnóstico Sintético |
| :--- | :---: | :---: | :--- |
| **1. Filtros y Búsqueda** | **6.5 / 10** | ⚠️ Mejorable | Buenos filtros base (curso, estado, origen), pero falta búsqueda en Tareas, rangos de fecha y chips de filtros activos con botón de reseteo. |
| **2. Control y Libertad del Usuario** | **5.0 / 10** | 🔴 Crítico | Experiencia mayormente de "solo lectura". Falta botón de Logout/Cerrar sesión en el Dashboard, acciones locales sobre tareas y feedback de operaciones. |
| **3. Densidad de Información** | **7.5 / 10** | 🟢 Bueno | Buena síntesis en tarjetas, pero el grid fijo de 3 columnas abruma cuando hay +15 tareas. Falta vista compacta/lista. |
| **4. Distribución y Jerarquía Visual** | **7.0 / 10** | 🟡 Aceptable | Estructura de dos columnas sólida en desktop, pero no escala bien en mobile (el lector de correos queda debajo de 25 tarjetas). |
| **5. Comodidad y Ergonomía (UX)** | **6.0 / 10** | ⚠️ Mejorable | Sin atajos de teclado, navegación móvil no adaptada (sidebar fijo de 256px), estados de foco inaccesibles (`outline-none`). |
| **6. Impacto Visual y Emocional** | **7.0 / 10** | 🟡 Aceptable | Limpio y moderno, pero monótono. Carece de Dark Mode (clave para estudiantes nocturnos) y skeletons durante la carga. |

---

## 🔍 2. Auditoría Detallada por Ejes

### 2.1. Filtros y Búsqueda

#### ❌ Problemas Detectados:
1. **Asimetría entre Tareas y Correos:** En Correos existe un buscador por texto con debounce, pero en el Dashboard de Tareas **no hay ningún buscador**. Si un estudiante busca el "TP2 de Física" o "Parcial", tiene que escanear visualmente tarjeta por tarjeta.
2. **Desconexión entre StatCards y Tabs (Tareas):** Las tarjetas superiores muestran "Pendientes (X)", "Vencidas (Y)", "Esta semana (Z)", "Completadas (W)", pero no son clickeables. Si el usuario hace click en "Vencidas", no filtra; debe buscar el tab manualmente. Además, hay un desacople conceptual: la StatCard dice "Vencidas", pero el tab correspondiente se llama "Urgentes" (que agrupa vencidas y las que vencen en <= 1 día).
3. **Ausencia de Filtros Temporales en Correos:** Solo se puede filtrar por curso, texto o no leídos. No se puede filtrar por período ("Esta semana", "Último mes") ni ordenar por fecha ascendente/descendente.
4. **Falta de Chips y "Limpiar Filtros":** Cuando se acumulan varios filtros (Curso: Álgebra + Origen: CVG + Solo no leídos + búsqueda de texto), el usuario pierde noción de qué condiciones están activas y debe desmarcarlas una por una.

---

### 2.2. Control y Libertad del Usuario

#### ❌ Problemas Detectados:
1. **Falta de Botón de Logout / Perfil:** Es el problema de control más severo del dashboard. No hay avatar de usuario, ni indicador de la cuenta logueada, ni botón de "Cerrar sesión". Un estudiante en una computadora compartida de la facultad o biblioteca no tiene forma de cerrar su sesión sin borrar cookies manualmente.
2. **Pasividad de las Tareas:** Las tareas solo abren el enlace externo a Google Classroom. El estudiante no puede:
   - Marcar una tarea como "En progreso" o "Pendiente de revisión".
   - Ocultar una tarea irrelevante o informativa.
   - Fijar (Pin/Star) una entrega crítica al tope de su lista.
3. **Paginación Ciegas en Correos:** El botón "Cargar más" no indica cuántos correos faltan o el total recuperado (ej. "Mostrando 25 de 84").
4. **Empty States mudos:** Cuando una categoría está vacía, el mensaje es un simple texto plano (`No hay tareas en esta categoría`). No hay refuerzo positivo (ej. *"¡Estás al día! No tenés entregas pendientes para este curso"* con una ilustración o micro-animación).

---

### 2.3. Cantidad de Información (Carga Cognitiva)

#### ❌ Problemas Detectados:
1. **Sobrecarga de Tarjetas en Grid 3x3:** En épocas de entregas o exámenes, un estudiante puede tener 20-30 tareas activas. Un grid de 3 columnas de tarjetas altas obliga a scroll excesivo y dificulta la priorización rápida.
2. **Puntos de calificación poco relevantes en primer plano:** Mostrar `100 pts` con el mismo peso visual que la fecha de entrega desvía la atención del dato verdaderamente crítico: **el vencimiento temporal**.
3. **Snippet de Correos truncado sin tooltip:** En pantallas medianas, el asunto se corta bruscamente sin tooltip con el texto completo.

---

### 2.4. Distribución de la Información (Layout & Jerarquía)

#### ❌ Problemas Detectados:
1. **Sidebar no colapsable:** Ocupa 256px fijos en todo momento. En pantallas de laptops compactas (13" o tablets a 1024px-1280px), le resta un espacio vital a la vista partida de correos.
2. **Experiencia Móvil Rota en Correos:**
   - En desktop, la distribución 40/60 (Lista a la izquierda, Lector a la derecha) funciona muy bien.
   - En mobile (`< 1024px`), la grilla pasa a `grid-cols-1`. Al tocar un correo, el usuario permanece arriba viendo la lista y el lector se renderiza **debajo de los 25 correos**, obligando a un scroll masivo para leer el mail.
3. **Sidebar sin agrupación de cursos por origen:** Los cursos de la barra lateral provienen exclusivamente de Classroom API. Las novedades de CVG quedan huérfanas en el sidebar a menos que coincidan exactamente por nombre de texto.

---

### 2.5. Comodidad y Ergonomía (UX & A11y)

#### ❌ Problemas Detectados:
1. **Inaccesibilidad por Teclado:** En Correos no se puede usar la tecla `J` (bajar al siguiente correo), `K` (subir), `Enter` (abrir) ni `/` para ir directo a la caja de búsqueda.
2. **Contraste de Texto Insuficiente:** Varios textos secundarios usan `text-slate-400` sobre fondos blancos o grises claros (`#94A3B8` sobre `#FFFFFF`), arrojando un ratio de contraste de ~2.8:1, cuando las pautas WCAG AA exigen mínimo 4.5:1.
3. **Foco Destructivo:** Múltiples inputs y botones tienen `focus:outline-none` sin proveer un anillo de foco visible (`focus-visible:ring-2`), dejando a los usuarios de navegación accesible a ciegas.

---

### 2.6. Impacto Visual y Emocional

#### ❌ Problemas Detectados:
1. **Sin Dark Mode:** Los estudiantes universitarios estudian y entregan tareas mayormente de noche. La interfaz actual es 100% blanca con fondo `#f1f5f9`, lo que genera fatiga visual severa en sesiones nocturnas.
2. **Feedback de Carga Anticuado:** Uso de spinners `Loader2` giratorios genéricos en lugar de *Skeleton loaders* que preparen al ojo humano para la geometría de la información que está por aparecer.
3. **Identidad de Marca "Syllo" poco aprovechada:** La landing tiene buena tipografía, pero dentro del dashboard el logo es un simple texto `text-indigo-600 font-bold`. Falta un imagotipo memorable y microinteracciones de éxito (confetti o check animado al completar tareas).

---

## 🚀 3. Catálogo de Propuestas y Features (Priorizadas)

A continuación se detalla la hoja de ruta dividida en 3 fases de impacto/esfuerzo:

```
                  ALTO IMPACTO
                       ▲
                       │   [Perfil + Logout]
        [Buscador Tareas]  │   [Modo Oscuro]
  [StatCards Clickeables]  │   [Lector Móvil Slide-over]
      [Skeletons de Carga] │   [Selector Grid/Lista]
───────────────────────┼────────────────────────► MAYOR ESFUERZO
      [Chips de Filtros]   │   [Acciones Locales / Pin]
      [Contraste Accesible]│   [Detector Fechas Parciales]
                       │   [Atajos de Teclado]
                  BAJO IMPACTO
```

---

### 🟢 FASE 1: Quick Wins (Inmediato — Alto impacto, bajo esfuerzo)

#### 1. Perfil de Usuario y Cerrar Sesión en Sidebar
- **Qué:** Añadir en la parte inferior del Sidebar una tarjeta de perfil con el avatar del usuario, su nombre/correo y un botón de `Cerrar Sesión` (invocando `signOut({ redirectTo: "/" })`).
- **Beneficio:** Privacidad y seguridad esencial en dispositivos compartidos. Cumple con la heurística de control del usuario.

#### 2. StatCards Clickeables y Sincronizadas
- **Qué:** Convertir las 4 tarjetas superiores de estadísticas en disparadores interactivos. Al hacer click en "Vencidas" o "Esta semana", el tab activo cambia automáticamente y se aplica el filtro correspondiente, con un indicador de borde activo.
- **Beneficio:** Menor fricción cognitiva; el usuario hace click naturalmente en el número que le llama la atención.

#### 3. Barra de Búsqueda Instantánea en Tareas
- **Qué:** Agregar un input de búsqueda arriba de los tabs en Tareas (`Buscar por título de tarea o tema...`) que filtre en tiempo real sobre el array de tareas en memoria.
- **Beneficio:** Localización de entregas puntuales en menos de 2 segundos.

#### 4. Badges de Conteo en Tabs
- **Qué:** Modificar los botones de tabs para incluir píldoras de conteo:  
  `Pendientes (12)` | `Urgentes (3)` | `Esta semana (5)` | `Completadas (8)`
- **Beneficio:** Previsualización del volumen de trabajo sin necesidad de entrar a cada pestaña.

#### 5. Skeletons en lugar de Spinners
- **Qué:** Sustituir el spinner centrado por 4 tarjetas esqueleto palpitantes (`animate-pulse`) tanto en Tareas como en la lista de Correos.
- **Beneficio:** Percepción de velocidad un 40% más rápida (perceived performance).

---

### 🟡 FASE 2: Ergonomía y Control (Mediano Plazo — Experiencia Pro)

#### 6. Selector de Vista: Tarjetas vs. Lista Compacta (Table/Row View)
- **Qué:** Permitir alternar con un botón toggle entre:
  - **Vista Grid:** Tarjetas ricas con descripción y etiquetas (ideal para pantallas grandes).
  - **Vista Lista:** Filas de 1 renglón con Estado, Curso, Título, Fecha y Puntos (ideal para escanear muchas tareas en poco espacio).
- **Beneficio:** Reduce la carga cognitiva de estudiantes con más de 10 materias activas.

#### 7. Dark Mode Nativo (Modo Estudio Nocturno)
- **Qué:** Incorporar tema oscuro con persistencia en `localStorage` o cookie, usando paleta `slate-900` / `zinc-900` y acentos índigo y esmeralda suaves.
- **Beneficio:** Salud visual en horarios de estudio nocturno.

#### 8. Experiencia Móvil de Correos (Patrón Maestro-Detalle)
- **Qué:** En pantallas `< 1024px`, al seleccionar un correo, la lista se oculta suavemente y se muestra el Lector a pantalla completa con un botón superior `← Volver a la bandeja`.
- **Beneficio:** Elimina el scroll infinito en celulares y hace la app 100% usable desde el móvil en la facultad.

#### 9. Barra de Filtros Activos con "Limpiar Todo"
- **Qué:** Si hay filtros activos (ej. Curso seleccionado + Origen CVG + Búsqueda), renderizar una hilera de chips:
  `[Física I ✕] [CVG ✕] ["parcial" ✕] [Limpiar filtros]`
- **Beneficio:** Orientación espacial inmediata sobre qué datos se están viendo.

#### 10. Atajos de Teclado (Power User Shortcuts)
- **Qué:**
  - `/`: Enfocar la barra de búsqueda inmediatamente.
  - `J` / `K`: Correo siguiente / anterior.
  - `Esc`: Limpiar búsqueda o deseleccionar correo.
  - `1`, `2`, `3`, `4`: Cambiar de pestaña en tareas.
- **Beneficio:** Fluidez y velocidad sin necesidad de ratón.

---

### 🟣 FASE 3: Features Avanzadas y Diferenciación (Largo Plazo)

#### 11. Tareas Fijadas (Pins) y Notas Personales
- **Qué:** Permitir al estudiante "anclar" al tope de la lista hasta 3 tareas críticas y añadir una nota privada o checklist interna (ej. *"Comprar papel milimetrado"* o *"Juntarse con Lucas"*).
- **Beneficio:** Convierte a Syllo de un simple visor pasivo en un verdadero centro de productividad activa.

#### 12. Extracción Inteligente de Parciales / Fechas de Examen
- **Qué:** Parsear en servidor correos que contengan palabras clave (*"Primer Parcial"*, *"Recuperatorio"*, *"Coloquio"*, *"Fecha límite"*) y mostrarlos en un panel destacado "Próximos Hitos y Exámenes".
- **Beneficio:** Evita que avisos cruciales queden enterrados en el historial de correos de Classroom o CVG.

#### 13. Vista Calendario Mensual / Semanal
- **Qué:** Una vista alternativa tipo almanaque mensual donde cada tarea aparece ubicada en su casillero de día con el color distintivo de la materia.
- **Beneficio:** Facilita la planificación temporal a mediano plazo y preparación de semanas de exámenes.

---

## 🎨 4. Guía de Especificaciones de Diseño y Código

### 4.1. Paleta Semántica Recomendada (WCAG AAA / AA Compliant)

| Rol | Token Light | Token Dark | Uso |
| :--- | :--- | :--- | :--- |
| **Fondo Principal** | `#F8FAFC` (`slate-50`) | `#0F172A` (`slate-900`) | Lienzo de la aplicación |
| **Superficie / Cards** | `#FFFFFF` (`white`) | `#1E293B` (`slate-800`) | Tarjetas de tareas y correos |
| **Bordes** | `#E2E8F0` (`slate-200`) | `#334155` (`slate-700`) | Delimitadores visuales |
| **Texto Primario** | `#0F172A` (`slate-900`) | `#F8FAFC` (`slate-50`) | Títulos y datos clave |
| **Texto Secundario** | `#475569` (`slate-600`) | `#94A3B8` (`slate-400`) | Fechas, subtítulos (ratio > 4.5:1) |
| **Acento Primario** | `#4F46E5` (`indigo-600`) | `#6366F1` (`indigo-500`) | Botones primarios y selección |
| **Classroom Badge** | `#ECFDF5` text `#047857` | `#064E3B` text `#6EE7B7` | Origen Google Classroom |
| **CVG Badge** | `#F0F9FF` text `#0369A1` | `#082F49` text `#7DD3FC` | Origen Campus Virtual UTN |
| **Urgente / Vencido** | `#FEF2F2` text `#B91C1C` | `#450A0A` text `#FCA5A5` | Entregas críticas |

---

### 4.2. Ejemplo de Componente: Tarjeta de Perfil & Logout para Sidebar

```tsx
// app/components/sidebar-user-footer.tsx
import { signOut } from "@/auth";

export function SidebarUserFooter({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  return (
    <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name ?? "Avatar"}
            className="w-8 h-8 rounded-full ring-1 ring-slate-200 shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-xs shrink-0">
            {user.name?.[0] ?? "U"}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-900 truncate">
            {user.name ?? "Estudiante"}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {user.email ?? ""}
          </p>
        </div>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          title="Cerrar sesión"
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
        </button>
      </form>
    </div>
  );
}
```

---

### 4.3. Ejemplo de Componente: Selector de Vista Grid / Lista en Tareas

```tsx
<div className="flex items-center justify-between gap-4 mb-4">
  {/* Buscador integrado */}
  <div className="relative flex-1 max-w-md">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      type="text"
      placeholder="Buscar entregas, temas o TPs..."
      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
    />
  </div>

  {/* Toggle Grid vs Lista */}
  <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
    <button
      onClick={() => setModoVista("grid")}
      className={`p-1.5 rounded-md ${modoVista === "grid" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
      title="Vista Cuadrícula"
    >
      <LayoutGrid size={16} />
    </button>
    <button
      onClick={() => setModoVista("lista")}
      className={`p-1.5 rounded-md ${modoVista === "lista" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
      title="Vista Lista Compacta"
    >
      <List size={16} />
    </button>
  </div>
</div>
```

---

## 📈 5. Métricas de Éxito para Medir el Impacto UX

Al implementar estas mejoras, se recomienda medir:
1. **Time-to-Task (Tiempo para encontrar una tarea):** Debería reducirse de ~15s a menos de 3s con la combinación de buscador y statcards clickeables.
2. **Tasa de rebote / Abandono de lectura en mobile:** Monitorear cuánto interactúan los usuarios en la vista móvil de correos tras habilitar el slide-over.
3. **Session Duration nocturna:** Aumento de tiempo de uso nocturno tras el despliegue del Dark Mode.
4. **Nivel de satisfacción del estudiante:** Valoración cualitativa sobre la tranquilidad y claridad que brinda la agenda centralizada.
