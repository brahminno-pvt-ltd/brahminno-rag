const BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ── Upload a file ──────────────────────────────────────────────────────────
export async function uploadFile(
  file: File,
  sessionId: string,
  onProgress?: (pct: number) => void
): Promise<{ chunks: number; filename: string }> {
  const form = new FormData();
  form.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/upload?session_id=${encodeURIComponent(sessionId)}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        const body = JSON.parse(xhr.responseText || "{}");
        reject(new Error(body.detail || `Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

// ── Upload a URL ───────────────────────────────────────────────────────────
export async function uploadUrl(
  url: string,
  sessionId: string
): Promise<{ chunks: number; url: string }> {
  const res = await fetch(`${BASE}/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, session_id: sessionId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `URL upload failed (${res.status})`);
  }

  return res.json();
}

// ── Stream a query ─────────────────────────────────────────────────────────
export async function* streamQuery(
  query: string,
  sessionId: string,
  topK = 4,
  hybrid = false
): AsyncGenerator<{ type: string; content: unknown }> {
  const res = await fetch(`${BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      session_id: sessionId,
      top_k: topK,
      hybrid,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Query failed (${res.status})`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop()!;

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;
        try {
          yield JSON.parse(data);
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}

// ── Reset session ──────────────────────────────────────────────────────────
export async function resetSession(sessionId: string): Promise<void> {
  await fetch(`${BASE}/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
}

// ── Health check ───────────────────────────────────────────────────────────
export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch(`${BASE}/health`);
  return res.json();
}
