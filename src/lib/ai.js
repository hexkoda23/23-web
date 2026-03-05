export async function askGroq(query, kbText, history = []) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_KEY;
  const model = import.meta.env.VITE_GROQ_MODEL || "openai/gpt-oss-20b";
  if (!apiKey) throw new Error("groq-not-configured");
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const system = [
    "You are 23's fashion assistant. Always answer efficiently and in a very friendly manner whenever asked any question.",
    "CRITICAL: If the user asks about 'delivery', 'shipping', 'how long', or 'when', strictly use the ETA information from the provided knowledge.",
    "Prefer provided brand knowledge when relevant; quote facts exactly.",
    "If asked about payment, include OPay Account Name and Number exactly as in knowledge.",
    "If asked 'who owns 23', state owner and brand manager from knowledge.",
    "Keep answers short (1–3 sentences). Avoid disclaimers.",
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
    temperature: 0.2,
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
