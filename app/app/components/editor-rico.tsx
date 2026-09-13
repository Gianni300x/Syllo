"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";

/**
 * Editor WYSIWYG de las Notas (Tiptap).
 *
 * El formato se ve aplicado mientras se escribe: no hay sintaxis markdown a la
 * vista ni modo "ver". El valor viaja al form en un input oculto como HTML, que
 * es lo que Tiptap serializa de forma nativa; el esquema de ProseMirror acota
 * las etiquetas posibles, así que no entra markup arbitrario aunque se pegue
 * contenido de otra página.
 */
export default function EditorRico({
  contenidoInicial,
  onCambio,
}: {
  /** HTML inicial. El markdown viejo ya viene convertido por `contenidoComoHtml`. */
  contenidoInicial: string;
  onCambio: (html: string) => void;
}) {
  const editor = useEditor({
    // Obligatorio en el App Router: renderizar en el servidor rompe la hidratación.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          // Tiptap ya descarta protocolos peligrosos; lo dejamos explícito.
          protocols: ["http", "https"],
        },
      }),
      Placeholder.configure({ placeholder: "Escribí tu nota…" }),
    ],
    content: contenidoInicial,
    editorProps: {
      attributes: {
        class:
          "nota-rica min-h-[280px] w-full flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-900 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
      },
    },
    onUpdate: ({ editor }) => onCambio(editor.getHTML()),
  });

  return (
    <>
      <Barra editor={editor} />
      <EditorContent editor={editor} className="flex flex-1 flex-col" />
    </>
  );
}

function Barra({ editor }: { editor: Editor | null }) {
  // `useEditorState` sería lo ideal, pero Tiptap ya re-renderiza este árbol en
  // cada transacción, así que `isActive` alcanza y evita otra abstracción.
  const activo = (nombre: string, attrs?: Record<string, unknown>) =>
    Boolean(editor?.isActive(nombre, attrs));

  return (
    <div className="my-2 flex flex-wrap items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 px-1 py-1 dark:border-slate-700 dark:bg-slate-900/50">
      <BotonBarra
        titulo="Negrita"
        atajo="⌘B"
        activo={activo("bold")}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <Bold size={15} />
      </BotonBarra>
      <BotonBarra
        titulo="Itálica"
        atajo="⌘I"
        activo={activo("italic")}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <Italic size={15} />
      </BotonBarra>
      <BotonBarra
        titulo="Tachado"
        activo={activo("strike")}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={15} />
      </BotonBarra>

      <Separador />

      <BotonBarra
        titulo="Título"
        activo={activo("heading", { level: 2 })}
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading2 size={15} />
      </BotonBarra>
      <BotonBarra
        titulo="Lista"
        activo={activo("bulletList")}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      >
        <List size={15} />
      </BotonBarra>
      <BotonBarra
        titulo="Lista numerada"
        activo={activo("orderedList")}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={15} />
      </BotonBarra>

      <Separador />

      <BotonBarra
        titulo="Deshacer"
        atajo="⌘Z"
        activo={false}
        deshabilitado={!editor?.can().undo()}
        onClick={() => editor?.chain().focus().undo().run()}
      >
        <Undo2 size={15} />
      </BotonBarra>
      <BotonBarra
        titulo="Rehacer"
        atajo="⇧⌘Z"
        activo={false}
        deshabilitado={!editor?.can().redo()}
        onClick={() => editor?.chain().focus().redo().run()}
      >
        <Redo2 size={15} />
      </BotonBarra>
    </div>
  );
}

function Separador() {
  return (
    <span
      aria-hidden
      className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700"
    />
  );
}

function BotonBarra({
  titulo,
  atajo,
  activo,
  deshabilitado = false,
  onClick,
  children,
}: {
  titulo: string;
  atajo?: string;
  activo: boolean;
  deshabilitado?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      title={atajo ? `${titulo} (${atajo})` : titulo}
      aria-label={titulo}
      aria-pressed={activo}
      className={`rounded-md p-1.5 transition-colors cursor-pointer disabled:cursor-default disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        activo
          ? "bg-slate-900 text-white dark:bg-slate-600"
          : "text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
      }`}
    >
      {children}
    </button>
  );
}
