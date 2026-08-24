"use client";

import { useState } from "react";
import { Headphones, Send, Sparkles } from "lucide-react";
import { getCurrentUserIdToken } from "../../lib/auth";

type Message = { content: string; role: "user" | "assistant" };

export function SupportAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsHuman, setNeedsHuman] = useState(false);
  const [status, setStatus] = useState("Answers use GoFunMotion help content. Do not share payment details or passwords.");

  async function ask(value = question) {
    const nextQuestion = value.trim();
    if (busy || !nextQuestion) return;
    const nextMessages = [...messages, { content: nextQuestion, role: "user" as const }].slice(-8);
    setMessages(nextMessages);
    setQuestion("");
    setBusy(true);
    setStatus("Checking GoFunMotion help content...");

    try {
      const token = await getCurrentUserIdToken();
      const response = await fetch("/api/ai/support", {
        body: JSON.stringify({ messages: nextMessages }),
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as { answer?: string; error?: string; needsHumanSupport?: boolean; provider?: string; setupWarning?: string | null } | null;
      if (!response.ok || !result?.answer) {
        setStatus(result?.error ?? "Support is temporarily unavailable.");
        return;
      }
      setMessages((current) => [...current, { content: result.answer ?? "", role: "assistant" as const }].slice(-8));
      setNeedsHuman(result.needsHumanSupport === true);
      setStatus(result.setupWarning ?? (result.provider === "openai" ? "AI-assisted answer from GoFunMotion help content." : "Answer from GoFunMotion help content."));
    } catch {
      setStatus("Support is temporarily unavailable. Email hello@gofunmotion.com for help.");
      setNeedsHuman(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-300 text-[#070816]">
          <Sparkles aria-hidden="true" size={20} />
        </span>
        <div>
          <h2 className="text-2xl font-black text-white">Ask GoFunMotion</h2>
          <p className="mt-1 text-sm leading-6 text-white/56">Fast help with booking requests, accounts, saved deals, and partner workflow.</p>
        </div>
      </div>

      <div aria-live="polite" className="mt-5 grid max-h-[26rem] gap-3 overflow-y-auto">
        {messages.length ? messages.map((message, index) => (
          <div
            className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm font-bold leading-6 ${message.role === "user" ? "ml-auto bg-lime-300 text-[#070816]" : "bg-black/28 text-white/72"}`}
            key={`${message.role}-${index}`}
          >
            {message.content}
          </div>
        )) : (
          <div className="flex flex-wrap gap-2">
            {["How does a booking request work?", "Where can I see request status?", "How do I list my business?"].map((prompt) => (
              <button className="min-h-10 rounded-full bg-white/[0.08] px-4 text-xs font-black text-white/66 hover:bg-white/[0.13]" key={prompt} onClick={() => void ask(prompt)} type="button">
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); void ask(); }}>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Support question</span>
          <input
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/28 px-4 text-sm font-bold text-white outline-none placeholder:text-white/34 focus:border-cyan-300/60"
            maxLength={1_200}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask a support question"
            value={question}
          />
        </label>
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#070816] hover:bg-lime-200 disabled:opacity-55" disabled={busy || !question.trim()} type="submit">
          <Send aria-hidden="true" size={17} />
          {busy ? "Checking..." : "Ask"}
        </button>
      </form>
      <div className="mt-3 flex flex-col gap-2 text-xs font-bold leading-5 text-white/46 sm:flex-row sm:items-center sm:justify-between">
        <p>{status}</p>
        {needsHuman ? (
          <a className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-white hover:bg-white/[0.13]" href="mailto:hello@gofunmotion.com">
            <Headphones aria-hidden="true" size={15} />
            Human support
          </a>
        ) : null}
      </div>
    </section>
  );
}
