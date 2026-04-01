import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export interface Source {
  source: string;
  page: number;
  snippet: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  loading?: boolean;
  timestamp: Date;
}

export interface UploadedDoc {
  id: string;
  name: string;
  chunks: number;
  uploadedAt: Date;
}

interface ChatStore {
  sessionId: string;
  messages: Message[];
  documents: UploadedDoc[];
  isStreaming: boolean;
  addMessage: (msg: Omit<Message, "id" | "timestamp">) => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  appendToken: (id: string, token: string) => void;
  addDocument: (doc: Omit<UploadedDoc, "id" | "uploadedAt">) => void;
  removeDocument: (id: string) => void;
  reset: () => void;
  setStreaming: (v: boolean) => void;
}

// Generate session ID lazily on client only — avoids SSR/client mismatch
const getInitialSessionId = () => {
  if (typeof window === "undefined") return "ssr-placeholder";
  const stored = sessionStorage.getItem("brahminno-session-id");
  if (stored) return stored;
  const id = uuidv4();
  sessionStorage.setItem("brahminno-session-id", id);
  return id;
};

export const useChatStore = create<ChatStore>((set) => ({
  sessionId: getInitialSessionId(),
  messages: [],
  documents: [],
  isStreaming: false,

  addMessage: (msg) => {
    const id = uuidv4();
    set((s) => ({
      messages: [...s.messages, { ...msg, id, timestamp: new Date() }],
    }));
    return id;
  },

  updateMessage: (id, updates) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  appendToken: (id, token) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + token } : m
      ),
    })),

  addDocument: (doc) =>
    set((s) => ({
      documents: [
        ...s.documents,
        { ...doc, id: uuidv4(), uploadedAt: new Date() },
      ],
    })),

  removeDocument: (id) =>
    set((s) => ({
      documents: s.documents.filter((d) => d.id !== id),
    })),

  reset: () => {
    const id = uuidv4();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("brahminno-session-id", id);
    }
    set({ messages: [], documents: [], sessionId: id });
  },

  setStreaming: (v) => set({ isStreaming: v }),
}));
