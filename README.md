# Brahminno RAG Chatbot

> A production-grade Retrieval-Augmented Generation (RAG) chatbot — upload documents and chat with them using OpenAI + LangChain + Next.js.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  FileUpload · URLUpload · ChatInput · MessageBubble     │
│  Zustand Store · SSE Streaming · Source Citations       │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / SSE
┌──────────────────────▼──────────────────────────────────┐
│                   FastAPI Backend                        │
│  POST /upload  POST /upload-url  POST /query            │
│  POST /reset   GET /health                              │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │     LangChain RAG       │
          │  ┌──────────────────┐   │
          │  │  FAISS VectorDB  │   │
          │  │  (embeddings)    │   │
          │  └──────────────────┘   │
          │  ┌──────────────────┐   │
          │  │  OpenAI LLM      │   │
          │  │  (streaming)     │   │
          │  └──────────────────┘   │
          │  ┌──────────────────┐   │
          │  │  Conv. Memory    │   │
          │  │  (10-turn window)│   │
          │  └──────────────────┘   │
          └─────────────────────────┘
```

---

## Features

| Feature | Details |
|---|---|
| Document ingestion | PDF, DOCX, TXT, URLs |
| Vector search | FAISS with MMR (Max Marginal Relevance) |
| Hybrid search | BM25 + vector ensemble (optional) |
| Streaming | Server-Sent Events (SSE) |
| Memory | 10-turn conversation buffer |
| Citations | Per-message source panel |
| Guardrails | Prompt injection detection, hallucination prevention |
| Persistence | FAISS stores saved to disk per session |
| Docker | Full stack docker-compose setup |

---

## Quick Start

### Option A — Docker (recommended)

```bash
# 1. Clone and enter the project
git clone <your-repo-url>
cd brahminno-rag

# 2. Set your OpenAI key
cp backend/.env.example backend/.env
# Edit backend/.env and set OPENAI_API_KEY=sk-...

# 3. Start everything
docker compose up --build

# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
```

---

### Option B — Local Development

**Backend**

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set OPENAI_API_KEY=sk-...

# Run server
uvicorn main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local if your backend runs on a different URL

# Run dev server
npm run dev
# Open http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key | **required** |
| `LLM_MODEL` | LLM model name | `gpt-4o-mini` |
| `EMBEDDING_MODEL` | Embedding model | `text-embedding-3-small` |
| `CHUNK_SIZE` | Text chunk size (tokens) | `1000` |
| `CHUNK_OVERLAP` | Chunk overlap | `200` |
| `LLM_TEMPERATURE` | Response temperature | `0.2` |
| `FAISS_PERSIST_DIR` | Path to save vector stores | `./faiss_stores` |
| `CORS_ORIGINS` | Allowed frontend origins | `["http://localhost:3000"]` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api` |

---

## Project Structure

```
brahminno-rag/
├── backend/
│   ├── api/
│   │   └── routes.py          # FastAPI endpoints
│   ├── chains/
│   │   ├── memory.py          # Conversation buffer memory
│   │   └── rag_chain.py       # LCEL RAG pipeline
│   ├── core/
│   │   ├── config.py          # Pydantic settings
│   │   ├── exceptions.py      # Custom exception handlers
│   │   ├── guardrails.py      # Prompt injection protection
│   │   └── logger.py          # Structured logging
│   ├── ingestion/
│   │   ├── ingestor.py        # File & URL ingestion
│   │   └── vector_store.py    # FAISS store management
│   ├── retrieval/
│   │   └── retriever.py       # MMR + hybrid retrieval
│   ├── main.py                # FastAPI app entrypoint
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx         # Root layout + fonts
│   │   ├── page.tsx           # Main chat page
│   │   └── globals.css        # Global styles + CSS variables
│   ├── components/
│   │   ├── Sidebar.tsx        # Document list + session reset
│   │   ├── FileUpload.tsx     # Drag & drop file upload
│   │   ├── URLUpload.tsx      # URL indexing input
│   │   ├── MessageBubble.tsx  # Chat message with sources
│   │   ├── ChatInput.tsx      # Input + send (streaming)
│   │   └── EmptyState.tsx     # Onboarding screen
│   ├── store/
│   │   └── chat.ts            # Zustand global state
│   ├── lib/
│   │   └── api.ts             # API client (upload, stream, reset)
│   ├── types/
│   │   └── index.ts           # Shared TypeScript types
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── Dockerfile
│   └── .env.local.example
│
├── samples/
│   └── brahminno_overview.txt # Demo document to test with
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload?session_id=x` | Upload PDF/DOCX/TXT file |
| `POST` | `/api/upload-url` | Index a URL |
| `POST` | `/api/query` | Stream a RAG query response |
| `POST` | `/api/reset` | Reset session memory + vector store |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/sessions/{id}/docs` | List indexed documents for session |

### Query Request Body

```json
{
  "session_id": "abc-123",
  "query": "What products does Brahminno offer?",
  "top_k": 4,
  "hybrid": false
}
```

### Streaming Response (SSE)

```
data: {"type": "token", "content": "Brahminno"}
data: {"type": "token", "content": " offers"}
...
data: {"type": "sources", "content": [...]}
data: [DONE]
```

---

## Switching LLM or Vector DB

**Use GPT-4o instead of GPT-4o-mini:**
```env
LLM_MODEL=gpt-4o
```

**Use a different embedding model:**
```env
EMBEDDING_MODEL=text-embedding-3-large
```

**Swap FAISS for Pinecone:** Replace `ingestion/vector_store.py` — the rest of the codebase is unchanged.

---

## Demo

1. Start the app
2. Upload `samples/brahminno_overview.txt`
3. Ask: *"What products does Brahminno offer?"*
4. Ask: *"How many engineers does the team have?"*
5. Ask: *"What is their revenue model?"*

---

## Tech Stack

**Backend:** Python 3.11 · FastAPI · LangChain · FAISS · OpenAI

**Frontend:** Next.js 14 · TypeScript · Tailwind CSS · Zustand · Framer Motion

**Fonts:** Syne (display) · DM Mono (monospace)

---

Built with ❤️ by Brahminno
