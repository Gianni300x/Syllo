import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de privacidad — Syllo",
  description:
    "Qué datos usa Syllo, para qué, dónde se guardan y cómo pedir que se borren.",
};

/**
 * Describe los scopes de `auth.ts`, las tablas de `lib/schema.ts` y el manejo
 * del enlace privado del CVG. Debe mantenerse alineada con el código real.
 */
export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 font-[family-name:var(--font-poppins)] text-foreground">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={15} />
          Volver a Syllo
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Política de privacidad
        </h1>
        <p className="mb-12 text-sm text-slate-500 dark:text-slate-400">
          Última actualización: septiembre de 2026
        </p>

        <Seccion titulo="Lo esencial">
          <p>
            Syllo es una agenda que reúne en un solo panel tus tareas y anuncios
            de Google Classroom, las fechas de tu CVG, tus notas y tu calendario.
            Accedemos a Google Classroom <strong>solo para leer</strong>: Syllo
            nunca modifica, envía ni borra nada. No accedemos a tu Gmail.
          </p>
          <p>
            No vendemos tus datos, no los compartimos con terceros y no usamos
            publicidad ni herramientas de analítica.
          </p>
        </Seccion>

        <Seccion titulo="Qué se guarda y qué no">
          <p>
            <strong>No guardamos</strong> el contenido de tus anuncios ni de tus
            tareas de Classroom. Se piden a Google y quedan en una memoria
            temporal de pocos minutos para evitar consultas repetidas.
          </p>
          <p>
            Si conectás el CVG, guardamos la URL privada de calendario que ese
            campus genera para vos. Se cifra antes de llegar a la base de datos
            y solo se usa para actualizar tus fechas. Nunca se muestra de nuevo
            ni se comparte con otros usuarios. Podés reemplazarla o desconectarla
            desde Novedades.
          </p>
          <p>
            <strong>Sí guardamos</strong>, asociado a tu dirección de correo, lo
            que vos creás dentro de Syllo:
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Las notas que escribís (título, contenido y curso).</li>
            <li>Los eventos que agregás al calendario.</li>
            <li>Qué cursos archivaste y los nombres cortos que les pusiste.</li>
            <li>
              Qué entregas marcaste como empezadas o fijaste, para que sigan
              así la próxima vez que entrés.
            </li>
          </ul>
          <p>
            Si activás el calendario suscribible, guardamos además el{" "}
            <strong>curso, el título, la fecha y el link</strong> de tus
            entregas pendientes. Es la única forma de que Google o Apple
            consulten tu calendario cuando vos no estás usando la app: lo hacen
            sin tu sesión, así que los datos tienen que estar de nuestro lado.
            No se guarda la descripción de las tareas, ni las que ya entregaste.
            Podés apagarlo generando un link nuevo y no suscribiéndolo, o
            pidiéndonos que lo borremos.
          </p>
          <p>
            Tu sesión vive en una cookie cifrada que contiene los tokens de
            acceso de Google Classroom. <strong>No</strong> se almacenan en nuestra base
            de datos: Syllo no puede entrar a tu cuenta de Google si vos no
            estás usando la app.
          </p>
        </Seccion>

        <Seccion titulo="Cookies">
          <p>
            Syllo usa <strong>una sola cookie propia</strong>: la de tu sesión.
            Va cifrada, no se puede leer desde otras páginas y es lo que te
            mantiene adentro sin tener que entrar de nuevo en cada clic. Al
            momento de iniciar sesión, Google suma unas cookies pasajeras para
            completar el ingreso de forma segura.
          </p>
          <p>
            Son las mínimas para que la app funcione: sin ellas no hay sesión
            posible, así que no hay nada que activar ni desactivar.
          </p>
          <p>
            <strong>No hay cookies de terceros, ni de analítica, ni de
            publicidad.</strong> Lo único que Syllo guarda además en tu
            navegador es si preferís el modo claro u oscuro: no es un dato
            personal, no se envía a ningún lado y no sale de ese dispositivo.
          </p>
          <p>
            Se borran cuando cerrás sesión, o cuando borrás los datos del sitio
            desde tu navegador.
          </p>
        </Seccion>

        <Seccion titulo="Con quién se comparte">
          <p>
            Con nadie, salvo la infraestructura necesaria para que la app
            funcione: <strong>Google Classroom</strong>, el <strong>CVG de UTN
            FRRo</strong> cuando vos lo conectás, y el proveedor de la base de
            datos donde se guardan tus notas, eventos, preferencias y el enlace
            cifrado del CVG. Ninguno los usa para otra finalidad de Syllo.
          </p>
        </Seccion>

        <Seccion titulo="Cómo borrar tus datos">
          <p>
            Podés borrar tus notas y eventos desde la app en cualquier momento.
          </p>
          <p>
            También podés cortarle el acceso a Syllo cuando quieras desde{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noreferrer noopener"
              className="text-indigo-600 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              los permisos de tu cuenta de Google
            </a>
            .
          </p>
        </Seccion>

        <Seccion titulo="Contacto">
          <p>
            Syllo lo construyen dos estudiantes. Si tenés una duda o querés implementar algo, escribinos a <Mail />.
          </p>
        </Seccion>
      </div>
    </main>
  );
}

/** El mail de contacto, en un solo lugar: aparece en dos secciones. */
const MAIL_CONTACTO = "gnnmessina@gmail.com";

function Mail() {
  return (
    <a
      href={`mailto:${MAIL_CONTACTO}`}
      className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
    >
      {MAIL_CONTACTO}
    </a>
  );
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {titulo}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

