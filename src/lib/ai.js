export async function askGemini(query, kbText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_KEY;
  if (!apiKey) throw new Error("gemini-not-configured");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const prompt = [
    "You are 23's fashion assistant. Answer clearly and briefly.",
    "Use the provided brand knowledge when relevant.",
    "If the answer is in the knowledge, prefer it. Otherwise, provide a helpful, fashion-focused response.",
    "",
    "Knowledge:",
    kbText || "",
    "",
    "User question:",
    query
  ].join("\n");
  const body = {
    contents: [{ parts: [{ text: prompt }]}]
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`gemini-error: ${text}`);
  }
  const data = await res.json();
  const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return output.trim();
}
