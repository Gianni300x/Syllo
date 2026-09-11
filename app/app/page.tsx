import { signIn } from "@/auth";
import ThemeToggle from "./(panel)/theme-toggle";

export default function Home() {
  return (
    <main className="syllo-landing">
      <style>{CSS}</style>
      <ThemeToggle />

      <div className="page">
        {/* ============ Hero ============ */}
        <div className="wrap">
          <section className="copy">
            <div className="brand">
              <span className="mark">S</span>
              Syllo
            </div>

            <h1>Todo lo que necesitás para cursar, en un solo lugar.</h1>

            <p className="sub">
              Los correos de Google Classroom y del CVG, y las tareas de
              todos tus cursos ordenadas por entrega, en un mismo lugar.
            </p>

            <ul className="scope">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                Correos de Classroom y del CVG
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M9 6h11M9 12h11M9 18h11" />
                  <path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" strokeLinecap="round" />
                </svg>
                Tareas y vencimientos ordenados
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 4h16v12l-4 4H4z" />
                  <path d="M16 20v-4h4" />
                </svg>
                Notas
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
                </svg>
                Calendario
              </li>
            </ul>

            <div className="actions">
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/dashboard" });
                }}
              >
                <button className="btn" type="submit">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continuá con Google
                </button>
              </form>
              <p className="note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
                </svg>
                Syllo solo lee tus cursos, tareas y correos. Nunca modifica ni
                envía nada por vos.
              </p>
            </div>
          </section>

          <section className="app" aria-label="Vista previa de Syllo">
            <div className="app__bar">
              <span className="mark">S</span>
              <b>Syllo</b>
              <span className="spacer"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>

            <div className="app__body">
              <nav className="nav">
                <span className="nav__group">Bandeja</span>
                <a href="#">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                  Classroom
                </a>
                <a href="#">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 3 2 8l10 5 10-5-10-5Z" /><path d="M6 11v5c0 1 2.7 3 6 3s6-2 6-3v-5" /></svg>
                  Universidad
                </a>
                <span className="nav__group">Cursada</span>
                <a href="#" className="is-active">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" strokeLinecap="round" /></svg>
                  Tareas
                </a>
                <a href="#">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 4h16v12l-4 4H4z" /><path d="M16 20v-4h4" /></svg>
                  Notas
                </a>
                <a href="#">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" /></svg>
                  Calendario
                </a>
              </nav>

              <div className="main">
                <h2>Tareas</h2>
                <p className="meta">7 pendientes · ordenadas por entrega</p>

                <div className="task">
                  <span className="check"></span>
                  <span className="title">TP Final — Sistemas Operativos</span>
                  <span className="src">Classroom</span>
                  <span className="due"><span className="flag"></span>mañana</span>
                </div>
                <div className="task">
                  <span className="check"></span>
                  <span className="title">Entrega 2 — Álgebra II</span>
                  <span className="src">Classroom</span>
                  <span className="due">en 2 días</span>
                </div>
                <div className="task">
                  <span className="check"></span>
                  <span className="title">Lectura Unidad 3 — Redes</span>
                  <span className="src">Universidad</span>
                  <span className="due">vie</span>
                </div>
                <div className="task">
                  <span className="check"></span>
                  <span className="title">Informe de laboratorio — Física</span>
                  <span className="src">Classroom</span>
                  <span className="due">lun</span>
                </div>

                <div className="divider"></div>

                <div className="mail">
                  <span className="from">Universidad</span>
                  Mesa de finales: inscripción abierta hasta el 20/9
                </div>
                <div className="mail">
                  <span className="from">Classroom</span>
                  Nuevo material en Álgebra II — Práctica 4
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ============ Cómo funciona ============ */}
        <section className="section">
          <h2>Cómo funciona</h2>
          <p className="lead">
            Syllo no reemplaza Classroom ni tu correo: los lee y te los ordena.
          </p>
          <ul className="steps">
            <li>
              <h3>Una sola cuenta</h3>
              <p>
                Entrás con la de Google que ya usás en Classroom. No hay
                registro, contraseña ni nada que configurar.
              </p>
            </li>
            <li>
              <h3>Se actualiza solo</h3>
              <p>
                Cada vez que abrís Syllo trae lo nuevo de Classroom y del
                correo de la UTN FRRo. Si querés, lo refrescás a mano.
              </p>
            </li>
            <li>
              <h3>Vos decidís qué ver</h3>
              <p>
                Filtrás por materia, archivás los cursos que terminaste y lo
                que no te sirve desaparece de la vista.
              </p>
            </li>
          </ul>
        </section>

        {/* ============ Lo que ves adentro ============ */}
        <section className="section">
          <h2>Lo que ves adentro</h2>
          <p className="lead">Cuatro secciones, ordenadas como cursás.</p>
          <ul className="features">
            <li>
              <div>
                <h3>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                  Correos
                </h3>
                <p>
                  Classroom y la UTN en una sola bandeja, con el curso al que
                  pertenece cada correo. Filtrás por materia o por no leídos.
                </p>  
              </div>
              <div className="mini" aria-hidden="true">
                <div className="row"><span className="from">Universidad</span><span className="t">Mesa de finales: inscripción abierta</span><span className="r">hoy</span></div>
                <div className="row"><span className="from">Classroom</span><span className="t">Nuevo material — Práctica 4</span><span className="pill">Álgebra II</span></div>
                <div className="row"><span className="from">Classroom</span><span className="t">Cambio de aula para el parcial</span><span className="pill">Física</span></div>
              </div>
            </li>

            <li>
              <div>
                <h3>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" strokeLinecap="round" /></svg>
                  Tareas
                </h3>
                <p>
                  Todas las entregas de todos los cursos, ordenadas por fecha y
                  con su estado: pendiente, urgente, entregada o vencida. Los
                  cursos que ya terminaste los archivás y desaparecen de la
                  vista.
                </p>
              </div>
              <div className="mini" aria-hidden="true">
                <div className="row"><span className="check"></span><span className="t">TP Final — Sistemas Operativos</span><span className="r urg">mañana</span></div>
                <div className="row"><span className="check"></span><span className="t">Entrega 2 — Álgebra II</span><span className="r">en 2 días</span></div>
                <div className="row"><span className="check done"></span><span className="t muted">Práctica 3 — Redes</span><span className="r ok">entregada</span></div>
              </div>
            </li>

            <li>
              <div>
                <h3>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 4h16v12l-4 4H4z" /><path d="M16 20v-4h4" /></svg>
                  Notas
                </h3>
                <p>
                  Notas rápidas por materia, guardadas en tu cuenta. Lo que
                  anotás en clase queda al lado de la entrega a la que
                  pertenece.
                </p>
              </div>
              <div className="mini nota" aria-hidden="true">
                <h4>Sistemas Operativos — TP Final</h4>
                <p>
                  Consultar al profe si el scheduler puede ser round-robin.
                  Entregar el informe en PDF, no en .docx.
                </p>
                <div className="stamp">Editada hace 2 horas</div>
              </div>
            </li>

            <li>
              <div>
                <h3>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" /></svg>
                  Calendario
                </h3>
                <p>
                  Los vencimientos de Classroom en una vista mensual. Con un
                  click los exportás a Google o Apple Calendar para que te
                  avisen ellos.
                </p>
              </div>
              <div className="mini cal" aria-hidden="true">
                <div className="head"><b>Septiembre</b><span>2026</span></div>
                <div className="grid">
                  {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                    <span key={`wd-${i}`} className="d wd">{d}</span>
                  ))}
                  {CALENDARIO_DIAS.map(({ n, clase }) => (
                    <span key={n} className={`d${clase ? ` ${clase}` : ""}`}>{n}</span>
                  ))}
                </div>
                <div className="foot"><span>↓ Exportar .ics</span></div>
              </div>
            </li>
          </ul>
        </section>

        {/* ============ Hecho por estudiantes ============ */}
        <section className="section about">
          <h2>Hecho por estudiantes</h2>
          <div>
            <p>
              Syllo lo hacemos dos estudiantes de la UTN Regional Rosario que
              nos cansamos de tener Classroom, el
              campus y un calendario abiertos al mismo tiempo para no
              perdernos una entrega.
            </p>
            <p>
              Lo usamos todos los días para nuestra propia cursada, y lo
              compartimos con compañeros. Si algo no anda o te falta,
              avisanos: la lista de cosas por hacer la escribimos entre todos.
            </p>
          </div>
        </section>

        <footer>
          <div className="brand">
            <span className="mark">S</span>
            Syllo
          </div>
          <span>Hecho por estudiantes, para estudiantes.</span>
        </footer>
      </div>
    </main>
  );
}

/** Días de la mini-maqueta del calendario (semanas del 7 al 27, "hoy" el 11). */
const CALENDARIO_DIAS: { n: number; clase?: string }[] = [
  { n: 7 }, { n: 8 }, { n: 9 }, { n: 10 }, { n: 11, clase: "today" }, { n: 12 }, { n: 13 },
  { n: 14 }, { n: 15, clase: "has" }, { n: 16 }, { n: 17 }, { n: 18, clase: "has" }, { n: 19 }, { n: 20 },
  { n: 21 }, { n: 22 }, { n: 23, clase: "has" }, { n: 24 }, { n: 25 }, { n: 26 }, { n: 27 },
];

const CSS = `
  .syllo-landing {
    --bg: #ffffff;
    --surface: #fbfbfa;
    --surface-2: #f4f3f1;
    --border: #e9e8e5;
    --border-strong: #dededa;
    --text: #37352f;
    --text-2: #6b6760;
    --text-3: #94918a;
    --accent: #4f46e5;
    --accent-weak: #eeedfb;
    --flag: #c4442e;
    --ok: #2f7a4b;
    --shadow-sm: 0 1px 2px rgba(24, 22, 18, 0.05);
    --shadow-lg: 0 1px 3px rgba(24, 22, 18, 0.05), 0 14px 34px -14px rgba(24, 22, 18, 0.16);

    min-height: 100svh;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    line-height: 1.5;
    padding-inline: clamp(1.25rem, 4vw, 3.5rem);
  }

  /* Modo oscuro: misma paleta cálida que el panel (globals.css), la marca no cambia. */
  .dark .syllo-landing {
    --bg: #262624;
    --surface: #2c2c2a;
    --surface-2: #363634;
    --border: #3e3e3a;
    --border-strong: #4b4a45;
    --text: #faf9f5;
    --text-2: #c2c0b6;
    --text-3: #9c9a90;
    --accent: #5b57e8;
    --accent-weak: rgba(129, 140, 248, 0.18);
    --flag: #e06b57;
    --ok: #6cbf8a;
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 1px 3px rgba(0, 0, 0, 0.3), 0 14px 34px -14px rgba(0, 0, 0, 0.6);
  }

  .syllo-landing *, .syllo-landing *::before, .syllo-landing *::after { box-sizing: border-box; }

  .syllo-landing ::selection { background: var(--accent-weak); color: var(--text); }

  .syllo-landing :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .syllo-landing .page { width: min(1120px, 100%); margin: 0 auto; }

  /* ---------- Hero ---------- */

  .syllo-landing .wrap {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: clamp(2rem, 5vw, 4.5rem);
    align-items: center;
    padding-block: clamp(2.5rem, 7vw, 5.5rem) clamp(3rem, 7vw, 5.5rem);
    animation: syllo-enter 640ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes syllo-enter {
    from { opacity: 0; transform: translateY(10px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .syllo-landing .wrap { animation: none; }
  }

  .syllo-landing .brand {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: -0.01em;
    margin-bottom: 1.75rem;
  }

  .syllo-landing .brand .mark {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: var(--accent);
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .syllo-landing h1 {
    margin: 0 0 1rem;
    font-size: clamp(1.9rem, 3.1vw, 2.65rem);
    line-height: 1.14;
    letter-spacing: -0.022em;
    font-weight: 600;
    text-wrap: balance;
  }

  .syllo-landing .sub {
    margin: 0 0 1.9rem;
    color: var(--text-2);
    font-size: 1.02rem;
    max-width: 42ch;
  }

  .syllo-landing .scope {
    list-style: none;
    margin: 0 0 2rem;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .syllo-landing .scope li {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.55rem 0;
    font-size: 0.94rem;
    border-top: 1px solid var(--border);
  }

  .syllo-landing .scope li:last-child { border-bottom: 1px solid var(--border); }

  .syllo-landing .scope svg {
    width: 16px;
    height: 16px;
    color: var(--text-3);
    flex: none;
  }

  .syllo-landing .actions {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    align-items: flex-start;
  }

  .syllo-landing .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.62rem 1.05rem;
    border-radius: 8px;
    background: var(--bg);
    color: var(--text);
    font: inherit;
    font-weight: 500;
    font-size: 0.95rem;
    text-decoration: none;
    border: 1px solid var(--border-strong);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
  }

  .syllo-landing .btn:hover { border-color: var(--accent); box-shadow: var(--shadow-lg); }
  .syllo-landing .btn:active { transform: translateY(1px); }

  .syllo-landing .btn svg { width: 17px; height: 17px; }

  .syllo-landing .note {
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    font-size: 0.82rem;
    color: var(--text-3);
    max-width: 40ch;
  }

  .syllo-landing .note svg {
    width: 14px;
    height: 14px;
    flex: none;
    margin-top: 0.15rem;
  }

  /* ---------- Maqueta del panel ---------- */

  .syllo-landing .app {
    border: 1px solid var(--border-strong);
    border-radius: 12px;
    background: var(--bg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    font-size: 0.82rem;
  }

  .syllo-landing .app__bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.85rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-2);
  }

  .syllo-landing .app__bar .mark {
    width: 16px;
    height: 16px;
    border-radius: 5px;
    background: var(--accent);
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 0.6rem;
    font-weight: 600;
  }

  .syllo-landing .app__bar b { color: var(--text); font-weight: 550; }
  .syllo-landing .app__bar .spacer { margin-left: auto; }

  .syllo-landing .app__bar .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--border-strong);
  }

  .syllo-landing .app__body {
    display: grid;
    grid-template-columns: 148px 1fr;
    min-height: 336px;
  }

  .syllo-landing .nav {
    border-right: 1px solid var(--border);
    background: var(--surface);
    padding: 0.7rem 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.12rem;
  }

  .syllo-landing .nav__group {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-3);
    padding: 0.5rem 0.5rem 0.3rem;
  }

  .syllo-landing .nav a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.36rem 0.5rem;
    border-radius: 6px;
    color: var(--text-2);
    text-decoration: none;
  }

  .syllo-landing .nav a svg { width: 14px; height: 14px; flex: none; }

  .syllo-landing .nav a.is-active {
    background: var(--surface-2);
    color: var(--text);
    font-weight: 500;
  }

  .syllo-landing .main {
    padding: 1rem 1.1rem;
    background: var(--bg);
  }

  .syllo-landing .main h2 {
    margin: 0 0 0.15rem;
    font-size: 0.98rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .syllo-landing .main p.meta {
    margin: 0 0 0.9rem;
    color: var(--text-3);
    font-size: 0.76rem;
  }

  .syllo-landing .task {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem 0;
    border-top: 1px solid var(--border);
  }

  .syllo-landing .task:first-of-type { border-top: none; }

  .syllo-landing .check {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 1.5px solid var(--border-strong);
    flex: none;
  }

  .syllo-landing .check.done { background: var(--ok); border-color: var(--ok); position: relative; }
  .syllo-landing .check.done::after {
    content: "";
    position: absolute;
    left: 3px; top: 0.5px;
    width: 3px; height: 6px;
    border: solid #fff;
    border-width: 0 1.5px 1.5px 0;
    transform: rotate(45deg);
  }

  .syllo-landing .task .title {
    color: var(--text);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .syllo-landing .task .src {
    color: var(--text-3);
    font-size: 0.72rem;
    flex: none;
  }

  .syllo-landing .task .due {
    margin-left: auto;
    flex: none;
    color: var(--text-2);
    font-size: 0.74rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .syllo-landing .flag {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--flag);
  }

  .syllo-landing .divider {
    height: 1px;
    background: var(--border);
    margin: 1rem 0 0.8rem;
  }

  .syllo-landing .mail {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.4rem 0;
    color: var(--text-2);
    font-size: 0.8rem;
  }

  .syllo-landing .mail .from {
    color: var(--text-3);
    font-size: 0.72rem;
    flex: none;
  }

  /* ---------- Secciones ---------- */

  .syllo-landing .section {
    border-top: 1px solid var(--border);
    padding-block: clamp(3rem, 6vw, 4.5rem);
  }

  .syllo-landing .section h2 {
    margin: 0 0 0.5rem;
    font-size: 1.35rem;
    font-weight: 600;
    letter-spacing: -0.015em;
    text-wrap: balance;
  }

  .syllo-landing .section .lead {
    margin: 0 0 2.25rem;
    color: var(--text-2);
    max-width: 56ch;
  }

  /* Cómo funciona */
  .syllo-landing .steps {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .syllo-landing .steps li { border-top: 1px solid var(--border); padding-top: 1rem; }
  .syllo-landing .steps h3 { margin: 0 0 0.3rem; font-size: 1rem; font-weight: 600; }
  .syllo-landing .steps p { margin: 0; color: var(--text-2); font-size: 0.94rem; }

  /* Lo que ves adentro */
  .syllo-landing .features {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .syllo-landing .features li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 260px;
    gap: 2.5rem;
    align-items: center;
    padding: 1.75rem 0;
    border-top: 1px solid var(--border);
  }

  .syllo-landing .features li:last-child { border-bottom: 1px solid var(--border); }

  .syllo-landing .features h3 {
    margin: 0 0 0.35rem;
    font-size: 1.05rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .syllo-landing .features h3 svg { width: 16px; height: 16px; color: var(--text-3); }
  .syllo-landing .features p { margin: 0; color: var(--text-2); font-size: 0.94rem; max-width: 48ch; }

  .syllo-landing .mini {
    border: 1px solid var(--border-strong);
    border-radius: 10px;
    background: var(--bg);
    box-shadow: var(--shadow-sm);
    padding: 0.7rem 0.8rem;
    font-size: 0.74rem;
    color: var(--text-2);
    justify-self: end;
    width: 100%;
  }

  .syllo-landing .mini .row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0;
    border-top: 1px solid var(--border);
  }

  .syllo-landing .mini .row:first-child { border-top: none; padding-top: 0; }
  .syllo-landing .mini .row .from { color: var(--text-3); font-size: 0.68rem; flex: none; width: 56px; }
  .syllo-landing .mini .row .t {
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .syllo-landing .mini .row .t.muted { color: var(--text-3); }
  .syllo-landing .mini .row .r { margin-left: auto; flex: none; font-size: 0.68rem; color: var(--text-3); }
  .syllo-landing .mini .row .r.urg { color: var(--flag); }
  .syllo-landing .mini .row .r.ok { color: var(--ok); }
  .syllo-landing .mini .row .check { width: 12px; height: 12px; }

  .syllo-landing .pill {
    font-size: 0.62rem;
    padding: 0.05rem 0.4rem;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    color: var(--text-3);
    flex: none;
  }

  .syllo-landing .mini.nota h4 { margin: 0 0 0.35rem; font-size: 0.8rem; font-weight: 600; color: var(--text); }
  .syllo-landing .mini.nota p { margin: 0; line-height: 1.45; }
  .syllo-landing .mini.nota .stamp { margin-top: 0.6rem; font-size: 0.66rem; color: var(--text-3); }

  .syllo-landing .mini.cal .head { display: flex; justify-content: space-between; margin-bottom: 0.45rem; }
  .syllo-landing .mini.cal .head b { color: var(--text); font-weight: 600; }
  .syllo-landing .mini.cal .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }

  .syllo-landing .mini.cal .d {
    aspect-ratio: 1;
    border-radius: 4px;
    background: var(--surface-2);
    display: grid;
    place-items: center;
    font-size: 0.6rem;
    color: var(--text-3);
    position: relative;
    font-variant-numeric: tabular-nums;
  }

  .syllo-landing .mini.cal .d.wd { font-size: 0.58rem; background: none; text-transform: uppercase; }
  .syllo-landing .mini.cal .d.has::after {
    content: "";
    position: absolute;
    bottom: 3px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--accent);
  }
  .syllo-landing .mini.cal .d.today { outline: 1.5px solid var(--accent); color: var(--text); }
  .syllo-landing .mini.cal .foot { margin-top: 0.55rem; display: flex; justify-content: flex-end; }
  .syllo-landing .mini.cal .foot span {
    font-size: 0.66rem;
    border: 1px solid var(--border-strong);
    border-radius: 6px;
    padding: 0.15rem 0.45rem;
    color: var(--text-2);
  }

  /* Hecho por estudiantes */
  .syllo-landing .about {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: clamp(2rem, 5vw, 4.5rem);
    align-items: start;
  }

  .syllo-landing .about p { margin: 0; color: var(--text-2); font-size: 1.02rem; max-width: 52ch; }
  .syllo-landing .about p + p { margin-top: 0.9rem; }

  /* Footer */
  .syllo-landing footer {
    border-top: 1px solid var(--border);
    padding-block: 1.5rem 2.5rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.5rem;
    font-size: 0.85rem;
    color: var(--text-3);
  }

  .syllo-landing footer .brand { margin: 0; font-size: 0.9rem; color: var(--text); }

  @media (max-width: 900px) {
    .syllo-landing .wrap {
      grid-template-columns: 1fr;
      gap: 2.25rem;
      padding-block: 2.5rem 3rem;
    }
    .syllo-landing .about { grid-template-columns: 1fr; gap: 1.5rem; }
    .syllo-landing .steps { grid-template-columns: 1fr; gap: 1.5rem; }
    .syllo-landing .features li { grid-template-columns: 1fr; gap: 1.1rem; }
    .syllo-landing .mini { justify-self: start; max-width: 320px; }
  }

  @media (max-width: 420px) {
    .syllo-landing .app__body { grid-template-columns: 1fr; }
    .syllo-landing .nav {
      flex-direction: row;
      flex-wrap: wrap;
      border-right: none;
      border-bottom: 1px solid var(--border);
    }
    .syllo-landing .nav__group { display: none; }
    .syllo-landing .nav a { padding: 0.3rem 0.45rem; }
    .syllo-landing .task .src { display: none; }
  }
`;
