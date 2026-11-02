import "server-only";

/**
 * Model-agnostic LLM layer. Business code only calls `complete()`.
 *
 *  AI_PROVIDER=openai-compatible  → any /v1/chat/completions endpoint
 *    (OpenAI, Groq, Together, OpenRouter, Ollama, LM Studio, Anthropic's OpenAI-compat endpoint…)
 *    AI_BASE_URL, AI_API_KEY, AI_MODEL
 *  AI_PROVIDER unset / "demo"     → built-in rule-based fallback so the site works offline.
 */

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface LLMProvider {
  name: string;
  complete(messages: ChatMessage[], opts?: { temperature?: number; maxTokens?: number }): Promise<string>;
}

const openaiCompatible: LLMProvider = {
  name: "openai-compatible",
  async complete(messages, opts = {}) {
    const base = (process.env.AI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.AI_API_KEY ? { Authorization: `Bearer ${process.env.AI_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL,
        messages,
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 900,
      }),
    });
    if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  },
};

export function getProvider(): LLMProvider | null {
  const p = process.env.AI_PROVIDER;
  if (p === "openai-compatible" && process.env.AI_MODEL) return openaiCompatible;
  return null; // demo mode
}
