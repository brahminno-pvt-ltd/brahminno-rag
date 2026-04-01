"use client";
import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { uploadFile } from "@/lib/api";
import { useChatStore } from "@/store/chat";
import { motion, AnimatePresence } from "framer-motion";

type Status = "idle" | "uploading" | "success" | "error";

export default function FileUpload() {
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { sessionId, addDocument } = useChatStore();

  const handleFile = async (file: File) => {
    setStatus("uploading");
    setProgress(0);
    setErrorMsg("");
    try {
      const res = await uploadFile(file, sessionId, setProgress);
      addDocument({ name: file.name, chunks: res.chunks });
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Upload failed");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="px-4 pt-3 pb-1">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => status === "idle" && fileRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed px-4 py-3 text-center
          transition-all duration-200 select-none
          ${dragging
            ? "border-[--accent] bg-[--accent]/10"
            : status === "success"
            ? "border-emerald-500/50 bg-emerald-500/5"
            : status === "error"
            ? "border-red-500/50 bg-red-500/5"
            : "border-[--border] hover:border-[--accent]/40 hover:bg-[--surface-2]/60"
          }
        `}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={onChange}
        />

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2"
            >
              <Upload size={14} className="text-[--muted]" />
              <span className="text-xs text-[--muted]">
                Drop <span className="text-white/60">PDF</span>,{" "}
                <span className="text-white/60">DOCX</span>, or{" "}
                <span className="text-white/60">TXT</span> — or click to browse
              </span>
            </motion.div>
          )}

          {status === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1.5"
            >
              <p className="text-xs text-[--accent] font-mono">
                Uploading… {progress}%
              </p>
              <div className="w-full h-1 bg-[--border] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[--accent] rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2"
            >
              <CheckCircle size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-mono">
                Indexed successfully
              </span>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2"
            >
              <AlertCircle size={14} className="text-red-400" />
              <span className="text-xs text-red-400 font-mono truncate max-w-xs">
                {errorMsg}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
