import { Info, Clock, CheckCircle2, Layers } from "lucide-react";
import { signIn } from "@/auth";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-800 flex items-center justify-center px-6 py-14 font-[family-name:var(--font-poppins)]">
      <div className="w-full max-w-5xl grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 text-balance mb-4">
            Inicia tu agenda
            <span className="block text-indigo-600"> con Syllo</span>
          </h1>

          <p className="text-slate-600 leading-relaxed mb-3">
            Syllo es una agenda pensada para estudiantes, que
            reúne las tareas de todos tus cursos de Google Classroom 
            las ordena por fecha de entrega y te muestra un 
            vistazo qué está pendiente, qué es urgente y qué ya entregaste.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed mb-8">
            Conectá tu cuenta de Google Classroom y tené todas tus tareas
            pendientes, urgentes y por vencer organizadas en un solo lugar.
          </p>

          <div className="flex flex-col gap-2.5">
            {[
              { Icon: Layers, color: "text-indigo-600", label: "Todos tus cursos juntos" },
              { Icon: Clock, color: "text-amber-600", label: "Vencimientos ordenados" },
              { Icon: CheckCircle2, color: "text-emerald-600", label: "Seguimiento de entregas" },
            ].map(({ Icon, color, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3"
              >
                <Icon className={`${color} flex-shrink-0`} size={20} />
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-12px_rgba(79,70,229,0.18)]">
          <h2 className="text-lg font-semibold text-slate-900 mb-1.5">
            Ingresá a tu cuenta
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Iniciá sesión con tu cuenta institucional para importar tus cursos y
            tareas automáticamente.
          </p>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-600/20 hover:-translate-y-0.5 transition-all rounded-xl py-3 font-semibold text-slate-700"
            >
              <GoogleIcon />
              Continuar con Google
            </button>
          </form>
          <p className="flex items-start gap-2 text-xs text-slate-400 mt-5 text-left">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            Solo se accede a tu lista de cursos y tareas. No se modifica ningún
            contenido en Classroom.
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}