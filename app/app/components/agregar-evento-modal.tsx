"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import NuevoEventoModal from "./nuevo-evento-modal";

export default function AgregarEventoModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm"
      >
        <Plus size={15} />
        Evento
      </motion.button>

      <NuevoEventoModal open={isOpen} onCerrar={() => setIsOpen(false)} />
    </>
  );
}
