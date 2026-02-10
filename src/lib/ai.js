export async function askGemini(query, kbText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_KEY;
  if (!apiKey) throw new Error("gemini-not-configured");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const prompt = [
    "System: You are 23's fashion assistant. Use a friendly, confident brand voice.",
    "Style: Make responses feel unique and conversational. Avoid generic disclaimers.",
    "Knowledge use: Prefer the provided knowledge when relevant; quote facts exactly.",
    "Special cases:",
    "- If asked about payment, include OPay Account Name and Number exactly as in knowledge.",
    "- If asked 'who owns 23', state the owner and brand manager from knowledge.",
    "Constraints: Keep answers concise (1–3 sentences).",
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
