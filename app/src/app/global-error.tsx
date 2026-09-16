"use client";

/**
 * Último recurso: si falla el layout raíz, Next reemplaza el documento entero,
 * así que este archivo tiene que traer su propio <html> y <body> y no puede
 * apoyarse en los estilos globales.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#eef1f6",
          color: "#393E46",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
            Syllo no pudo iniciar
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "0 0 1.5rem" }}>
            Ocurrió un error inesperado. Recargá la página; si sigue pasando,
            cerrá sesión y volvé a entrar.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#4F46E5",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.625rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
          {error.digest && (
            <p style={{ marginTop: "1.25rem", fontSize: "0.6875rem", color: "#94a3b8" }}>
              {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
