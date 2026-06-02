const BASE_URL = "http://localhost:8000";

export async function sendMessage(message, history = []) {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) throw new Error("API error");
  return response.json();
}
