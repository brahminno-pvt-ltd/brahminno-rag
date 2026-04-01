"use client";
import { Message } from "@/store/chat";
import { Copy, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MessageBubble({ msg }: { msg: Message }) {
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5
          ${isUser
            ? "bg-[--accent] shadow-md shadow-[--accent]/30"
            : "bg-[--surface-2] border border-[--border] text-[--muted]"
          }`}
      >
        {isUser ? "U" : "B"}
      </div>

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        {msg.loading ? (
          <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[--surface-2] border border-[--border]">
            <div className="flex gap-1.5 items-center h-4">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        ) : (
          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words
              ${isUser
                ? "bg-[--accent] text-white rounded-tr-sm shadow-md shadow-[--accent]/20"
                : "bg-[--surface-2] border border-[--border] rounded-tl-sm text-white/90"
              }`}
          >
            {msg.content}
          </div>
        )}

        {/* Action bar */}
        {!isUser && !msg.loading && msg.content && (
          <div className="flex items-center gap-3 px-1">
            <button
              onClick={copy}
              className="flex items-center gap-1 text-[10px] text-[--muted] hover:text-white transition-colors font-mono"
            >
              {copied ? (
                <><Check size={10} className="text-emerald-400" /> copied!</>
              ) : (
                <><Copy size={10} /> copy</>
              )}
            </button>

            {msg.sources && msg.sources.length > 0 && (
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-1 text-[10px] text-[--accent] hover:text-white transition-colors font-mono"
              >
                {showSources ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                {msg.sources.length} source{msg.sources.length !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}

        {/* Sources panel */}
        <AnimatePresence>
          {showSources && msg.sources && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden w-full"
            >
              <div className="space-y-1.5 pt-1">
                {msg.sources.map((s, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[--surface-2] border border-[--border] text-[10px] font-mono"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1 h-1 rounded-full bg-[--accent] shrink-0" />
                      <span className="text-[--accent] truncate flex-1">
                        {s.source}
                        {s.page ? ` · p.${s.page}` : ""}
                      </span>
                    </div>
                    <p className="text-[--muted] line-clamp-2 leading-relaxed">
                      {s.snippet}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
