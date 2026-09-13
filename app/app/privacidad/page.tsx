import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de privacidad — Syllo",
  description:
    "Qué datos usa Syllo, para qué, dónde se guardan y cómo pedir que se borren.",
};

/**
 * Google exige una política de privacidad publicada para verificar la app con
 * el scope restringido `gmail.readonly` (ver README). El contenido describe lo
 * que el código realmente hace: los scopes de `auth.ts`, las tablas de
 * `lib/schema.ts` y el cacheo de `tareas-server.ts` / `correos-server.ts`.
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
            Syllo es una agenda que reúne en un solo panel tus tareas de Google
            Classroom, los correos de Classroom y de tu universidad, tus notas y
            tu calendario. Accedemos a tu cuenta de Google <strong>solo para
            leer</strong>: Syllo nunca modifica, envía ni borra nada en
            Classroom ni en tu correo.
          </p>
          <p>
            No vendemos tus datos, no los compartimos con terceros y no usamos
            publicidad ni herramientas de analítica.
          </p>
        </Seccion>

        <Seccion titulo="Qué permisos pedimos y para qué">
          <ul className="space-y-3">
            <Permiso scope="classroom.courses.readonly">
              Listar tus cursos activos, para armar la barra lateral y agrupar
              todo por materia.
            </Permiso>
            <Permiso scope="classroom.coursework.me.readonly">
              Leer el trabajo asignado de cada curso: título, descripción,
              puntaje y fecha de entrega.
            </Permiso>
            <Permiso scope="classroom.student-submissions.me.readonly">
              Saber si cada tarea está entregada o pendiente, para poder
              clasificarlas.
            </Permiso>
            <Permiso scope="gmail.readonly">
              Leer únicamente los correos que te mandan Google Classroom y tu
              universidad, para mostrarlos en la bandeja de Syllo. La búsqueda
              está acotada a esos remitentes: el resto de tu correo no se
              consulta.
            </Permiso>
          </ul>
        </Seccion>

        <Seccion titulo="Qué se guarda y qué no">
          <p>
            <strong>No guardamos</strong> tus tareas ni tus correos en nuestra
            base de datos. Se piden a Google en el momento y quedan en una
            memoria temporal de pocos minutos, solo para que la app no vuelva a
            consultar lo mismo en cada clic.
          </p>
          <p>
            <strong>Sí guardamos</strong>, asociado a tu dirección de correo, lo
            que vos creás dentro de Syllo:
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Las notas que escribís (título y contenido).</li>
            <li>Los eventos que agregás al calendario.</li>
            <li>Qué cursos archivaste y los nombres cortos que les pusiste.</li>
          </ul>
          <p>
            Tu sesión vive en una cookie cifrada que contiene los tokens de
            acceso de Google. No se almacenan en nuestra base de datos.
          </p>
        </Seccion>

        <Seccion titulo="Cómo protegemos el contenido de los correos">
          <p>
            El cuerpo de cada correo se muestra dentro de un marco aislado, sin
            permiso para ejecutar scripts ni para acceder al resto de Syllo. Las
            imágenes remotas quedan bloqueadas hasta que vos las pidas, así el
            remitente no se entera de que abriste el mensaje.
          </p>
        </Seccion>

        <Seccion titulo="Con quién se comparte">
          <p>
            Con nadie, salvo la infraestructura necesaria para que la app
            funcione: <strong>Google</strong> (de donde vienen tus datos) y el
            proveedor de la base de datos donde se guardan tus notas, eventos y
            preferencias de cursos. Ninguno de los dos los usa para otra cosa.
          </p>
        </Seccion>

        <Seccion titulo="Cómo borrar tus datos">
          <p>
            Podés borrar tus notas y eventos desde la app en cualquier momento.
            Para eliminar toda tu información, escribinos y damos de baja todo
            lo asociado a tu cuenta.
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
            Syllo lo construyen dos estudiantes. Si tenés una duda o querés que
            borremos tus datos, escribinos a{" "}
            <strong>hola@syllo.app</strong>.
          </p>
        </Seccion>
      </div>
    </main>
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

function Permiso({
  scope,
  children,
}: {
  scope: string;
  children: React.ReactNode;
}) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
      <code className="text-xs font-[family-name:var(--font-geist-mono)] text-indigo-600 dark:text-indigo-400">
        {scope}
      </code>
      <p className="mt-1">{children}</p>
    </li>
  );
}
