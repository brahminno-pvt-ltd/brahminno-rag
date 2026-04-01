import { Brain, FileText, Globe, MessageSquare, Zap } from "lucide-react";

const steps = [
  {
    icon: FileText,
    label: "Upload a document",
    desc: "PDF, DOCX, or TXT",
  },
  {
    icon: Globe,
    label: "Or paste a URL",
    desc: "Index any webpage",
  },
  {
    icon: MessageSquare,
    label: "Ask questions",
    desc: "Natural language queries",
  },
  {
    icon: Zap,
    label: "Get cited answers",
    desc: "Grounded in your docs",
  },
];

export default function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-10 px-8 py-12">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="relative mx-auto w-fit">
          <div className="w-20 h-20 rounded-2xl bg-[--accent]/10 border border-[--accent]/20 flex items-center justify-center mx-auto">
            <Brain size={40} className="text-[--accent]" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0a0a0f] animate-pulse" />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Chat with your documents
          </h2>
          <p className="text-sm text-[--muted] mt-2 max-w-sm mx-auto leading-relaxed">
            Upload files or index URLs. Every answer is grounded in your
            content — no hallucinations, with full source citations.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {steps.map(({ icon: Icon, label, desc }, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 p-3.5 rounded-xl bg-[--surface-2] border border-[--border] hover:border-[--accent]/30 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-[--accent]/10 border border-[--accent]/20 flex items-center justify-center">
              <Icon size={14} className="text-[--accent]" />
            </div>
            <div>
              <p className="text-xs font-semibold">{label}</p>
              <p className="text-[10px] text-[--muted] mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[--surface-2] border border-[--border]">
        <div className="w-1.5 h-1.5 rounded-full bg-[--accent]" />
        <span className="text-[10px] font-mono text-[--muted]">
          Powered by LangChain · FAISS · OpenAI
        </span>
      </div>
    </div>
  );
}
