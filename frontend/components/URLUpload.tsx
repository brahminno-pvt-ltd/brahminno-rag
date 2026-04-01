"use client";
import { useState, KeyboardEvent } from "react";
import { Link2, Loader2, CheckCircle } from "lucide-react";
import { uploadUrl } from "@/lib/api";
import { useChatStore } from "@/store/chat";

export default function URLUpload() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { sessionId, addDocument } = useChatStore();

  const handleSubmit = async () => {
    const trimmed = url.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await uploadUrl(trimmed, sessionId);
      addDocument({ name: trimmed, chunks: res.chunks });
      setUrl("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to index URL");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="px-4 pb-3">
      <div className="flex gap-2">
        <div
          className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border bg-[--surface-2] text-sm transition-colors
            ${error ? "border-red-500/40" : success ? "border-emerald-500/40" : "border-[--border] focus-within:border-[--accent]/40"}`}
        >
          {success ? (
            <CheckCircle size={12} className="text-emerald-400 shrink-0" />
          ) : (
            <Link2 size={12} className="text-[--muted] shrink-0" />
          )}
          <input
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            onKeyDown={onKey}
            placeholder="Paste a URL to index…"
            className="bg-transparent outline-none flex-1 text-xs placeholder:text-[--muted] font-mono"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !url.trim()}
          className="px-3 py-2 rounded-xl bg-[--surface-2] border border-[--border] text-xs
            hover:border-[--accent]/50 hover:text-[--accent] disabled:opacity-40
            transition-all font-mono flex items-center gap-1.5"
        >
          {loading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            "Index"
          )}
        </button>
      </div>
      {error && (
        <p className="text-[10px] text-red-400 mt-1 font-mono px-1">{error}</p>
      )}
    </div>
  );
}
