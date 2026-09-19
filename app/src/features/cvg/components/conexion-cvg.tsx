"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarSync, CheckCircle2, ExternalLink, Link2, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  conectarCalendarioCvg,
  desconectarCalendarioCvg,
} from "../services/cvg-actions";
import type { EstadoCalendarioCvg } from "../types";

export default function ConexionCvg({ estado }: { estado: EstadoCalendarioCvg }) {
  const enlaceVencido = estado.error === "enlace_vencido";
  const [editando, setEditando] = useState(!estado.conectado || enlaceVencido);
  const [url, setUrl] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();
  const router = useRouter();

  function conectar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensaje(null);
    iniciarTransicion(async () => {
      const resultado = await conectarCalendarioCvg(url);
      if (!resultado.ok) {
        setMensaje(resultado.error ?? "No pudimos conectar el calendario.");
        return;
      }
      setUrl("");
      setEditando(false);
      setMensaje(
        resultado.cantidadEventos === 1
          ? "Calendario conectado: encontramos 1 evento."
          : `Calendario conectado: encontramos ${resultado.cantidadEventos ?? 0} eventos.`,
      );
      router.refresh();
    });
  }

  function desconectar() {
    iniciarTransicion(async () => {
      const resultado = await desconectarCalendarioCvg();
      if (!resultado.ok) {
        setMensaje(resultado.error ?? "No pudimos desconectar el calendario.");
        return;
      }
      setEditando(true);
      setMensaje("Calendario CVG desconectado.");
      router.refresh();
    });
  }

  return (
    <Card className="border border-slate-200 bg-white py-0 shadow-none dark:border-slate-700 dark:bg-slate-800">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
              <CalendarSync size={18} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  Calendario del CVG
                </h2>
                {estado.conectado && !enlaceVencido && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={13} /> Conectado
                  </span>
                )}
              </div>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Tus fechas del campus se actualizan solas. El enlace se guarda cifrado y nunca se muestra de nuevo.
              </p>
            </div>
          </div>

          {estado.conectado && !editando && (
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
                Cambiar enlace
              </Button>
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>
                  <Unplug size={14} /> Desconectar
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Desconectar el calendario CVG?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Las fechas del CVG dejarán de aparecer en Syllo. No se borra nada en el campus.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={desconectar}
                      disabled={pendiente}
                    >
                      Desconectar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {enlaceVencido && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            El enlace dejó de responder. Generá uno nuevo en el CVG y reemplazalo acá.
          </p>
        )}

        {estado.error === "sin_eventos" && !editando && (
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
            La conexión funciona, aunque el CVG no devolvió eventos en este momento.
          </p>
        )}

        {editando && (
          <form onSubmit={conectar} className="mt-4 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <Input
                  type="url"
                  value={url}
                  onChange={(evento) => setUrl(evento.target.value)}
                  placeholder="https://frro.cvg.utn.edu.ar/calendar/export_execute.php?..."
                  aria-label="URL privada del calendario CVG"
                  autoComplete="off"
                  spellCheck={false}
                  required
                  className="h-9 pl-9"
                />
              </div>
              <Button type="submit" disabled={pendiente || !url.trim()} className="h-9">
                {pendiente ? "Comprobando…" : "Conectar calendario"}
              </Button>
              {estado.conectado && (
                <Button type="button" variant="ghost" className="h-9" onClick={() => setEditando(false)}>
                  Cancelar
                </Button>
              )}
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              En el CVG: <strong>Área personal → Importar o exportar calendarios → Exportar calendario</strong>. Elegí “Todos los eventos” y “Intervalo personalizado”, después “Obtener URL”.
            </p>
            <a
              href="https://frro.cvg.utn.edu.ar/calendar/export.php"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Abrir el CVG <ExternalLink size={12} />
            </a>
          </form>
        )}

        {mensaje && (
          <p role="status" className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {mensaje}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
