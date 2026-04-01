"use client";
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/chat";
import Sidebar from "@/components/Sidebar";
import FileUpload from "@/components/FileUpload";
import URLUpload from "@/components/URLUpload";
import MessageBubble from "@/components/MessageBubble";
import ChatInput from "@/components/ChatInput";
import EmptyState from "@/components/EmptyState";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { messages, documents } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent SSR/hydration mismatch — render nothing until client is ready
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!mounted) return null;

  const userMsgCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0f]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 py-3.5 border-b border-[--border] flex items-center justify-between shrink-0 bg-[--surface]/60 backdrop-blur-sm">
          <div>
            <h1 className="text-sm font-bold tracking-tight">Document Intelligence</h1>
            <p className="text-[10px] text-[--muted] font-mono">
              {documents.length > 0
                ? `${documents.length} doc${documents.length !== 1 ? "s" : ""} indexed · ${userMsgCount} question${userMsgCount !== 1 ? "s" : ""} asked`
                : "No documents indexed yet"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-[--muted] font-mono">RAG active</span>
          </div>
        </header>

        {/* Upload area */}
        <div className="border-b border-[--border] bg-[--surface]/40 shrink-0">
          <FileUpload />
          <URLUpload />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="px-6 py-4 space-y-5 max-w-3xl mx-auto w-full">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <MessageBubble msg={msg} />
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 max-w-3xl w-full mx-auto">
          <ChatInput />
        </div>
      </main>
    </div>
  );
}
