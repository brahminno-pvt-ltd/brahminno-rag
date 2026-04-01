"use client";
import {
  useState,
  KeyboardEvent,
  useRef,
  useEffect,
} from "react";
import { Send, Loader2 } from "lucide-react";
import { useChatStore } from "@/store/chat";
import { streamQuery } from "@/lib/api";
import type { Source } from "@/store/chat";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const {
    sessionId,
    addMessage,
    appendToken,
    updateMessage,
    isStreaming,
    setStreaming,
    documents,
  } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  }, [input]);

  const handleSend = async () => {
    const query = input.trim();
    if (!query || isStreaming) return;

    setInput("");
    addMessage({ role: "user", content: query });
    const aiId = addMessage({ role: "assistant", content: "", loading: true });
    setStreaming(true);

    try {
      for await (const event of streamQuery(query, sessionId)) {
        if (event.type === "token") {
          updateMessage(aiId, { loading: false });
          appendToken(aiId, event.content as string);
        } else if (event.type === "sources") {
          updateMessage(aiId, { sources: event.content as Source[] });
        } else if (event.type === "error") {
          updateMessage(aiId, {
            content: `⚠️ ${event.content}`,
            loading: false,
          });
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      updateMessage(aiId, {
        content: `⚠️ Connection error: ${msg}`,
        loading: false,
      });
    } finally {
      setStreaming(false);
      textareaRef.current?.focus();
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const disabled = isStreaming || documents.length === 0;
  const canSend = !disabled && input.trim().length > 0;

  return (
    <div className="p-4">
      <div
        className={`flex items-end gap-3 rounded-2xl border p-3 transition-all duration-200
          ${disabled
            ? "border-[--border] opacity-60"
            : "border-[--border] focus-within:border-[--accent]/50 focus-within:shadow-lg focus-within:shadow-[--accent]/5"
          }`}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          disabled={disabled}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={
            documents.length === 0
              ? "Upload a document to start chatting…"
              : "Ask anything about your documents…"
          }
          className="flex-1 bg-transparent resize-none outline-none text-sm
            placeholder:text-[--muted] scrollbar-thin"
          style={{ fontFamily: "var(--font-display)", minHeight: "24px" }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
            transition-all duration-150
            ${canSend
              ? "bg-[--accent] hover:bg-[--accent-dim] shadow-md shadow-[--accent]/30"
              : "bg-[--surface-2] border border-[--border] opacity-40"
            }`}
        >
          {isStreaming ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>
      <p className="text-[9px] text-[--muted]/50 text-center mt-2 font-mono">
        Enter to send · Shift+Enter for newline · Answers grounded in your documents
      </p>
    </div>
  );
}
