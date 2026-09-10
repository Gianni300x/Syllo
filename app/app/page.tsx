import { signIn } from "@/auth";

export default function Home() {
  return (
    <main className="syllo-landing">
      <style>{CSS}</style>

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
    </main>
  );
}

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
    --shadow-sm: 0 1px 2px rgba(24, 22, 18, 0.05);
    --shadow-lg: 0 1px 3px rgba(24, 22, 18, 0.05), 0 14px 34px -14px rgba(24, 22, 18, 0.16);

    min-height: 100svh;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    line-height: 1.5;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(1.25rem, 4vw, 3.5rem);
  }

  .syllo-landing *, .syllo-landing *::before, .syllo-landing *::after { box-sizing: border-box; }

  .syllo-landing ::selection { background: var(--accent-weak); color: var(--text); }

  .syllo-landing :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .syllo-landing .wrap {
    width: min(1120px, 100%);
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: clamp(2rem, 5vw, 4.5rem);
    align-items: center;
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

  .syllo-landing .scope .soon {
    margin-left: auto;
    font-size: 0.72rem;
    color: var(--text-3);
    border: 1px solid var(--border-strong);
    border-radius: 999px;
    padding: 0.1rem 0.5rem;
    letter-spacing: 0.01em;
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

  .syllo-landing .nav a .soon {
    margin-left: auto;
    font-size: 0.6rem;
    color: var(--text-3);
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

  .syllo-landing .task .check {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 1.5px solid var(--border-strong);
    flex: none;
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

  .syllo-landing .task .due .flag {
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

  @media (max-width: 900px) {
    .syllo-landing {
      align-items: flex-start;
      padding-top: 2.5rem;
      padding-bottom: 2.5rem;
    }
    .syllo-landing .wrap {
      grid-template-columns: 1fr;
      gap: 2.25rem;
    }
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
    .syllo-landing .nav a .soon,
    .syllo-landing .task .src { display: none; }
  }
`;
