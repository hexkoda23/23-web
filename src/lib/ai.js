export async function askGroq(query, kbText, history = []) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_KEY;
  const model = import.meta.env.VITE_GROQ_MODEL || "openai/gpt-oss-20b";
  if (!apiKey) throw new Error("groq-not-configured");
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const system = [
    "You are 23's fashion assistant. You MUST answer efficiently and in a friendly manner.",
    "CRITICAL: For questions about 'delivery', 'shipping', 'ETA', or 'how long', ONLY use the shipping info: Nigeria 1-3 days, Africa 3-7 days, international 5-10 days.",
    "If the query is NOT about shipping/delivery, answer based on brand knowledge or care instructions.",
    "If you are unsure or the question is unrelated (like math), ask the user to stick to fashion/brand questions.",
    "Prefer provided brand knowledge; quote facts exactly. Keep answers 1-3 sentences.",
    kbText ? `\nKnowledge:\n${kbText}` : ""
  ].join("\n");
  const mappedHistory = history.slice(-8).map(m => ({
    role: m.role === "bot" ? "assistant" : (m.role === "user" ? "user" : "assistant"),
    content: String(m.content || "")
  }));
  const messages = [
    { role: "system", content: system },
    ...mappedHistory,
    { role: "user", content: query }
  ];
  const body = {
    model,
    messages,
    temperature: 0.1,
    max_tokens: 512
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`groq-error: ${text}`);
  }
  const data = await res.json();
  const output = data?.choices?.[0]?.message?.content || "";
  return output.trim();
}
