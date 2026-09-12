"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Archive, ArchiveRestore, Edit2, MoreVertical, Check, X } from "lucide-react";
import { colorParaCurso, bgParaCurso } from "./sidebar";
import { useFiltroCursos } from "../(panel)/filtro-cursos";

export function CursoItem({ 
  nombre, 
  listaCursos, 
  seleccionado, 
  esArchivado 
}: { 
  nombre: string; 
  listaCursos: string[]; 
  seleccionado: boolean;
  esArchivado: boolean;
}) {
  const { toggleCurso, conteoPorCurso, archivarCursos, restaurarCursos, renombres, renombrarCurso, renombrando, archivando } = useFiltroCursos();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(renombres[nombre] || nombre);
  const menuRef = useRef<HTMLDivElement>(null);

  const nombreMostrar = renombres[nombre] || nombre;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function guardarNombre(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (nuevoNombre.trim() !== (renombres[nombre] || nombre)) {
      renombrarCurso(nombre, nuevoNombre);
    }
    setEditando(false);
  }

  function toggleMenu(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuAbierto(!menuAbierto);
  }

  return (
    <motion.div 
      layout="position" 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className={`relative group ${menuAbierto ? "z-50" : "z-0"}`}
      ref={menuRef}
    >
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!editando) toggleCurso(nombre);
          }
        }}
        onClick={() => {
          if (!editando) toggleCurso(nombre);
        }}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer ${
          esArchivado ? "opacity-75 hover:opacity-100 " : ""
        }${
          seleccionado
            ? "bg-indigo-50 text-slate-900 dark:bg-indigo-500/15 dark:text-slate-100"
            : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
        }`}
      >
        <span className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className={`flex-shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
              seleccionado
                ? `${bgParaCurso(nombre, listaCursos)} border-transparent`
                : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-700"
            }`}
          >
            {seleccionado && (
              <svg className="w-2 h-2 text-white" viewBox="0 0 12 12" fill="none" strokeWidth="2.5" stroke="currentColor">
                <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>

          {editando ? (
            <div className="flex-1 flex items-center gap-1 min-w-0" onClick={e => e.stopPropagation()}>
              <input 
                autoFocus
                type="text" 
                value={nuevoNombre}
                onChange={e => setNuevoNombre(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setEditando(false);
                  if (e.key === 'Enter') guardarNombre(e as unknown as React.FormEvent);
                }}
                className="flex-1 bg-white border border-indigo-300 rounded px-1.5 py-0.5 text-xs text-slate-900 outline-none w-full min-w-0 dark:bg-slate-800 dark:text-white dark:border-indigo-500"
              />
              <button onClick={guardarNombre} disabled={renombrando} className="text-green-600 hover:text-green-700 dark:text-green-400 p-0.5">
                <Check size={14} />
              </button>
              <button onClick={() => setEditando(false)} className="text-red-500 hover:text-red-600 dark:text-red-400 p-0.5">
                <X size={14} />
              </button>
            </div>
          ) : (
            <span className={`truncate ${colorParaCurso(nombre, listaCursos)}`} title={nombreMostrar}>
              {nombreMostrar}
            </span>
          )}
        </span>

        {!editando && (
          <div className="flex items-center shrink-0">
            {conteoPorCurso[nombre] > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 mr-1 ${
                  seleccionado
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {conteoPorCurso[nombre]}
              </span>
            )}
            
            {/* Botón 3 puntitos, visible al hover o si el menú está abierto */}
            <div 
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleMenu(e as unknown as React.MouseEvent);
                }
              }}
              onClick={toggleMenu} 
              className={`p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 dark:hover:text-slate-200 transition-colors ${menuAbierto ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <MoreVertical size={14} />
            </div>
          </div>
        )}
      </div>

      {/* Menú desplegable */}
      {menuAbierto && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 dark:bg-slate-800 dark:border-slate-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setNuevoNombre(renombres[nombre] || nombre);
              setEditando(true);
              setMenuAbierto(false);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Edit2 size={12} /> Renombrar
          </button>
          
          {esArchivado ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                restaurarCursos([nombre]);
                setMenuAbierto(false);
              }}
              disabled={archivando}
              className="w-full text-left px-3 py-1.5 text-xs text-indigo-600 hover:bg-slate-100 flex items-center gap-2 dark:text-indigo-400 dark:hover:bg-slate-700"
            >
              <ArchiveRestore size={12} /> Desarchivar
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                archivarCursos([nombre]);
                setMenuAbierto(false);
              }}
              disabled={archivando}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-2 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <Archive size={12} /> Archivar
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
