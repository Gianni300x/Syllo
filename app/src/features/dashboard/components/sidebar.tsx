"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  BookOpen,
  CalendarDays,
  ListChecks,
  LogOut,
  Mail,
  NotebookPen,
  RefreshCw,
  Home,
} from "lucide-react";
import { useFiltroCursos } from "../hooks/filtro-cursos";
import { CursoItem } from "@/features/archivados/components/curso-item";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "motion/react";

export type Seccion = "inicio" | "tareas" | "correos" | "notas" | "calendario";

export interface UsuarioSidebar {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/** Pill sólida cuando está activo, igual que antes — el resto de la sidebar
 *  usa el tinte suave de `--sidebar-accent` (selección de curso). */
const NAV_ACTIVO =
  "data-active:bg-indigo-600 data-active:text-white data-active:hover:bg-indigo-600 data-active:hover:text-white dark:data-active:bg-indigo-600";

export default function Sidebar({
  cursos,
  usuario,
  onCerrarSesion,
  onActualizar,
  actualizando = false,
}: {
  cursos: string[];
  usuario?: UsuarioSidebar;
  onCerrarSesion?: () => void;
  onActualizar?: () => void;
  actualizando?: boolean;
}) {
  const pathname = usePathname();
  const seccion: Seccion = pathname?.startsWith("/dashboard/correos")
    ? "correos"
    : pathname?.startsWith("/dashboard/notas")
      ? "notas"
      : pathname?.startsWith("/dashboard/calendario")
        ? "calendario"
        : pathname?.startsWith("/dashboard/tareas")
          ? "tareas"
          : "inicio";

  // El resto del contexto (toggle, conteos, archivar) lo consume `CursoItem`.
  const { cursosSeleccionados, limpiarCursos, cursosArchivados } = useFiltroCursos();

  const haySeleccion = cursosSeleccionados.length > 0;
  // Los archivados no se listan, pero `cursos` completo se sigue usando para
  // los colores: dependen del índice en la lista original.
  const cursosVisibles = cursos.filter((c) => !cursosArchivados.includes(c));

  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader className="px-4 pt-4 pb-6">
        <div className="flex items-center justify-between gap-3 text-[#4F46E5]">
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
            Syllo
          </span>
          {onActualizar && (
            <Button
              onClick={onActualizar}
              disabled={actualizando}
              variant="ghost"
              size="icon-sm"
              title="Actualizar datos"
              className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/15"
            >
              <RefreshCw size={15} className={actualizando ? "animate-spin" : ""} />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <EnlaceSeccion
                href="/dashboard"
                icono={<Home size={16} />}
                etiqueta="Inicio"
                activo={seccion === "inicio"}
              />
              <EnlaceSeccion
                href="/dashboard/tareas"
                icono={<ListChecks size={16} />}
                etiqueta="Tareas"
                activo={seccion === "tareas"}
              />
              <EnlaceSeccion
                href="/dashboard/correos"
                icono={<Mail size={16} />}
                etiqueta="Correos"
                activo={seccion === "correos"}
              />
              <EnlaceSeccion
                href="/dashboard/notas"
                icono={<NotebookPen size={16} />}
                etiqueta="Notas"
                activo={seccion === "notas"}
              />
              <EnlaceSeccion
                href="/dashboard/calendario"
                icono={<CalendarDays size={16} />}
                etiqueta="Calendario"
                activo={seccion === "calendario"}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Cursos: multi-selección, scrollea internamente */}
        <SidebarGroup className="flex-1 min-h-0 flex flex-col">
          <SidebarGroupLabel>MIS CURSOS</SidebarGroupLabel>
          {haySeleccion && (
            <SidebarGroupAction
              onClick={limpiarCursos}
              className="w-auto whitespace-nowrap px-1.5 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Ver todos
            </SidebarGroupAction>
          )}

          {/* Indicador de cantidad seleccionada */}
          {haySeleccion && (
            <p className="px-2 text-[11px] text-slate-400 mb-1 group-data-[collapsible=icon]:hidden dark:text-slate-500">
              {cursosSeleccionados.length === 1
                ? "1 curso seleccionado"
                : `${cursosSeleccionados.length} cursos seleccionados`}
            </p>
          )}

          <SidebarGroupContent className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={limpiarCursos}
                  isActive={!haySeleccion}
                  tooltip="Todos los cursos"
                >
                  <BookOpen
                    size={16}
                    className={!haySeleccion ? "text-indigo-600 dark:text-indigo-400" : ""}
                  />
                  <span>Todos los cursos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <AnimatePresence mode="popLayout">
                {[
                  ...cursosVisibles.map((nombre) => (
                    <CursoItem
                      key={nombre}
                      nombre={nombre}
                      listaCursos={cursos}
                      seleccionado={cursosSeleccionados.includes(nombre)}
                      esArchivado={false}
                    />
                  )),
                  cursosArchivados.length > 0 ? (
                    <motion.li
                      key="archivados-header"
                      layout="position"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mt-4 mb-1 px-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 tracking-wider group-data-[collapsible=icon]:hidden dark:text-slate-500"
                    >
                      <Archive size={12} />
                      ARCHIVADOS
                    </motion.li>
                  ) : null,
                  ...cursosArchivados.map((nombre) => (
                    <CursoItem
                      key={nombre}
                      nombre={nombre}
                      listaCursos={cursos}
                      seleccionado={cursosSeleccionados.includes(nombre)}
                      esArchivado={true}
                    />
                  )),
                ]}
              </AnimatePresence>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Pie: perfil de usuario y logout */}
      {usuario && (
        <SidebarFooter>
          <div className="pt-2 border-t border-sidebar-border flex items-center justify-between gap-3 group-data-[collapsible=icon]:justify-center">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="ring-1 ring-slate-200 shrink-0 dark:ring-slate-600">
                {usuario.image && (
                  <AvatarImage
                    src={usuario.image}
                    alt={usuario.name ?? "Avatar"}
                    referrerPolicy="no-referrer"
                  />
                )}
                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold select-none dark:bg-indigo-500/20 dark:text-indigo-300">
                  {usuario.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-semibold truncate">
                  {usuario.name ?? "Estudiante"}
                </p>
                <p className="text-[11px] text-slate-500 truncate dark:text-slate-400">
                  {usuario.email ?? ""}
                </p>
              </div>
            </div>

            {onCerrarSesion && (
              <Button
                onClick={onCerrarSesion}
                variant="ghost"
                size="icon-sm"
                title="Cerrar sesión"
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0 group-data-[collapsible=icon]:hidden dark:hover:text-red-400 dark:hover:bg-red-500/10"
              >
                <LogOut size={16} />
              </Button>
            )}
          </div>
        </SidebarFooter>
      )}
      <SidebarRail />
    </SidebarPrimitive>
  );
}

function EnlaceSeccion({
  href,
  icono,
  etiqueta,
  activo,
}: {
  href: string;
  icono: React.ReactNode;
  etiqueta: string;
  activo: boolean;
}) {
  // El filtro vive en la URL, así que cambiar de sección lo perdería si el link
  // no se lo lleva puesto. Solo viaja `curso`: `tab` y `vista` son de Tareas.
  const { hrefConFiltro } = useFiltroCursos();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={activo}
        tooltip={etiqueta}
        className={NAV_ACTIVO}
        render={
          <Link
            href={hrefConFiltro(href)}
            onClick={() => {
              // En mobile el drawer se cierra al elegir una sección.
              if (isMobile) setOpenMobile(false);
            }}
          />
        }
      >
        {icono}
        <span>{etiqueta}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
