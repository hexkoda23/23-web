export async function askGroq(query, kbText, history = []) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_KEY;
  const model = import.meta.env.VITE_GROQ_MODEL || "openai/gpt-oss-20b";
  if (!apiKey) throw new Error("groq-not-configured");

  const url = "https://api.groq.com/openai/v1/chat/completions";
  const system = [
    "You are 23, the AI fashion assistant for the Lagos-based clothing brand 23 / Twentythree.",
    "Your job is to answer customer questions accurately using the retrieved context below. Be polished, direct, and useful.",
    "",
    "## Accuracy Rules",
    "- Use exact prices, sizes, stock status, payment details, shipping times, and policies only when they appear in the retrieved context.",
    "- Do not invent products, discounts, delivery dates, inventory, policies, or payment information.",
    "- If the context does not contain a confirmed answer, say the studio team should confirm it via Instagram @twentythreepreppy or WhatsApp 08107869063.",
    "- If the user asks about a product, include the product name, price, sizes/status when available, and the product URL if provided.",
    "- If the user asks for styling advice, recommend only 23 catalog products from the retrieved context unless giving general fashion advice.",
    "- Keep answers concise. Prefer 2-5 short sentences or a compact list.",
    "",
    "## Brand Voice",
    "- Confident, warm, and high-fashion, but not vague.",
    "- Sound like a sharp store stylist, not a generic support bot.",
    "- Accuracy matters more than luxury language.",
    "",
    "## Confirmed Payment Details",
    "Bank: OPay",
    "Account Number: 8072715465",
    "Account Name: Ashibogwu Chukwudi Hilary",
    "Send payment receipt and delivery address to WhatsApp https://wa.me/2348107869063 or Instagram @twentythreepreppy.",
    "",
    "## Confirmed Delivery",
    "Nigeria: 1-3 business days. Africa: 3-7 business days. International: 5-10 business days.",
    "",
    kbText ? `## Retrieved Context\n${kbText}` : ""
  ].join("\n");

  const mappedHistory = history.slice(-8).map(message => ({
    role: message.role === "bot" ? "assistant" : (message.role === "user" ? "user" : "assistant"),
    content: String(message.content || "")
  }));

  const messages = [
    { role: "system", content: system },
    ...mappedHistory,
    { role: "user", content: query }
  ];

  const body = {
    model,
    messages,
    temperature: 0.35,
    max_tokens: 650
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
