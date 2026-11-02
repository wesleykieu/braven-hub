"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { Markdown } from "./markdown";
import { aiProfile, useProfile } from "./profile-provider";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["What events are this week?", "Find alumni in tech", "Jobs for my major", "Help with my resume"];

export function AiAssistant() {
  const { profile } = useProfile();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hey! I'm **Bravo**, your Braven Hub guide. Ask me to find an event, an alum to talk to, or a job that fits you." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Close the panel when the assistant navigates you somewhere on mobile.
  useEffect(() => {
    if (window.innerWidth < 640) setOpen(false);
  }, [pathname]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "assistant", messages: next.slice(1), profile: aiProfile(profile) }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.text ?? data.error ?? "Something went wrong." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "I couldn't reach the server. Try again?" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
            className="fixed right-3 bottom-24 left-3 z-50 flex h-[min(560px,calc(100dvh-8rem))] flex-col overflow-hidden rounded-3xl border bg-white shadow-[0_24px_80px_rgb(1_25_54/0.22)] sm:left-auto sm:w-[400px] sm:right-6"
          >
            <div className="flex items-center justify-between bg-brand-navy px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand-blue to-[#7d8cff]">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Bravo</p>
                  <p className="text-xs text-white/60">AI guide · events, alumni, jobs</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-white/10" aria-label="Close assistant">
                <X className="size-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#f7f8fc] px-4 py-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={m.role === "user" ? "flex justify-end" : "flex"}
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-md bg-brand-blue px-3.5 py-2.5 text-sm text-white"
                        : "max-w-[90%] rounded-2xl rounded-bl-md border bg-white px-3.5 py-2.5 shadow-sm"
                    }
                  >
                    {m.role === "user" ? m.content : <Markdown text={m.content} />}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-1 rounded-2xl border bg-white px-4 py-3 shadow-sm" style={{ width: "fit-content" }}>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="size-1.5 rounded-full bg-brand-navy/40"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              )}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border bg-white px-3 py-1.5 text-xs font-medium hover:border-brand-blue/40 hover:text-brand-blue">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t bg-white p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                className="h-10 flex-1 rounded-full border bg-muted/40 px-4 text-sm outline-none focus:border-brand-blue/50 focus:bg-white"
              />
              <button disabled={!input.trim() || loading} className="grid size-10 place-items-center rounded-full bg-brand-navy text-white disabled:opacity-40" aria-label="Send">
                <ArrowUp className="size-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="fixed right-4 bottom-5 z-50 flex items-center gap-2 rounded-full bg-brand-navy py-3 pr-5 pl-3 text-sm font-medium text-white shadow-[0_12px_40px_rgb(1_25_54/0.35)] sm:right-6 sm:bottom-6"
        aria-label="Open AI assistant"
      >
        <span className="relative grid size-8 place-items-center rounded-full bg-gradient-to-br from-brand-blue to-[#7d8cff]">
          <Sparkles className="size-4" />
          <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-brand-navy bg-emerald-400" />
        </span>
        {open ? "Close" : "Ask Bravo"}
      </motion.button>
    </>
  );
}
