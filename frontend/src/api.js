const BASE_URL = "http://localhost:8000";

export async function sendMessageStream(message, history = [], onChunk, onDone) {
  const response = await fetch(`${BASE_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) throw new Error("Stream failed");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sources = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.type === "sources") {
          sources = data.sources;
        } else if (data.type === "content") {
          onChunk(data.content);
        } else if (data.type === "done") {
          onDone(sources);
        }
      } catch {}
    }
  }
}

export async function sendMessage(message, history = []) {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!response.ok) throw new Error("API error");
  return response.json();
}
