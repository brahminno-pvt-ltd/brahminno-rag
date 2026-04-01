"use client";
import { useChatStore } from "@/store/chat";
import { FileText, RotateCcw, Brain, Trash2 } from "lucide-react";
import { resetSession } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const { documents, reset, sessionId, removeDocument } = useChatStore();

  const handleReset = async () => {
    try {
      await resetSession(sessionId);
    } catch {
      // ignore network errors on reset
    }
    reset();
  };

  return (
    <aside className="w-64 h-full flex flex-col border-r border-[--border] bg-[--surface] shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-[--border]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[--accent] flex items-center justify-center shadow-lg shadow-[--accent]/20">
            <Brain size={16} />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight">Brahminno</span>
          </div>
        </div>
        <p className="text-[10px] text-[--muted] mt-1.5 font-mono tracking-wider uppercase">
          Document Intelligence
        </p>
      </div>

      {/* Documents list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-mono text-[--muted] uppercase tracking-widest">
            Indexed Docs
          </p>
          <span className="text-[10px] font-mono text-[--accent] bg-[--accent]/10 px-1.5 py-0.5 rounded">
            {documents.length}
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="text-center mt-10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[--surface-2] border border-[--border] flex items-center justify-center mx-auto">
              <FileText size={16} className="text-[--muted]" />
            </div>
            <p className="text-[11px] text-[--muted]">No documents yet</p>
            <p className="text-[10px] text-[--muted]/60">Upload files to begin</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="group flex items-start gap-2 p-2.5 rounded-xl bg-[--surface-2] border border-[--border] hover:border-[--accent]/30 transition-colors"
                >
                  <FileText size={13} className="text-[--accent] mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium truncate leading-tight">
                      {doc.name}
                    </p>
                    <p className="text-[10px] text-[--muted] font-mono mt-0.5">
                      {doc.chunks} chunks
                    </p>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 size={11} className="text-[--muted] hover:text-red-400 transition-colors" />
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Session info + Reset */}
      <div className="p-4 border-t border-[--border] space-y-2">
        <p className="text-[9px] text-[--muted]/50 font-mono truncate">
          session: {sessionId.slice(0, 16)}…
        </p>
        <button
          onClick={handleReset}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
        >
          <RotateCcw size={12} />
          Reset Session
        </button>
      </div>
    </aside>
  );
}
