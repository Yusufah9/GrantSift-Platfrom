"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  hasProPrompt?: boolean;
}

export function AIAssistantWidget({ orgName }: { orgName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I am your Grant OS Intelligence Assistant. How can I help ${
        orgName || "your organization"
      } today? Ask about grant matchmaking, eligibility analysis, proposal drafting, or budget structuring.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          payload: {
            messages: newMessages,
            orgContext: { orgName: orgName || "My Organization" },
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.response) {
        const respText = data.data.response;
        const hasProPrompt = respText.includes("Subscribe as a Pro user") || respText.includes("Pro subscriber");
        setMessages([...newMessages, { role: "assistant", content: respText, hasProPrompt }]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "I ran into a temporary issue retrieving funder analysis. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Network connection error. Please verify your connection and retry.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper shadow-2xl transition-transform hover:scale-105 active:scale-95 border-2 border-paper-line"
        aria-label="Open AI Grant Assistant"
      >
        <span className="text-xl">✨</span>
      </button>

      {/* Floating Drawer / Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[540px] w-[380px] sm:w-[440px] flex-col overflow-hidden rounded-2xl border border-paper-line bg-paper-raised shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-paper-line bg-paper px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stamp-tint text-stamp-dark text-xs">
                ✨
              </span>
              <div>
                <h3 className="font-serif text-sm font-semibold text-ink">Grant OS Assistant</h3>
                <p className="text-[11px] text-ink-faint">AI intelligence layer &bull; Active</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-ink-faint hover:bg-paper hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-paper-line/60 bg-paper/50 px-3 py-2 text-[11px] no-scrollbar">
            <button
              type="button"
              onClick={() => handleSend("Match grants for my startup and business profile")}
              className="whitespace-nowrap rounded-full border border-paper-line bg-amber-50 text-amber-900 font-medium px-2.5 py-1 hover:bg-amber-100"
            >
              ✨ Match Grants
            </button>
            <button
              type="button"
              onClick={() => handleSend("What are the key eligibility requirements for our profile?")}
              className="whitespace-nowrap rounded-full border border-paper-line bg-paper-raised px-2.5 py-1 text-ink-soft hover:bg-paper hover:text-ink"
            >
              Eligibility Check
            </button>
            <button
              type="button"
              onClick={() => handleSend("How can we improve our Grant Readiness Scorecard?")}
              className="whitespace-nowrap rounded-full border border-paper-line bg-paper-raised px-2.5 py-1 text-ink-soft hover:bg-paper hover:text-ink"
            >
              Readiness Gaps
            </button>
            <button
              type="button"
              onClick={() => handleSend("What are standard allowable budget categories for grants?")}
              className="whitespace-nowrap rounded-full border border-paper-line bg-paper-raised px-2.5 py-1 text-ink-soft hover:bg-paper hover:text-ink"
            >
              Budget Rules
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-ink text-paper"
                      : "border border-paper-line bg-paper text-ink shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                {m.hasProPrompt && (
                  <div className="mt-1.5 max-w-[88%] rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-[11px] text-amber-950 flex items-center justify-between gap-2 shadow-sm">
                    <span>Unlock all 40,000+ grants & direct submission links</span>
                    <Link
                      href="/pricing"
                      className="whitespace-nowrap rounded-lg bg-amber-900 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-black transition-colors"
                    >
                      Upgrade to Pro &rarr;
                    </Link>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-paper-line bg-paper px-3.5 py-2 text-xs text-ink-faint">
                  Analyzing grant intelligence…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="border-t border-paper-line bg-paper p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about grants, proposals, budgets…"
                className="flex-1 rounded-xl border border-paper-line bg-paper-raised px-3 py-2 text-xs text-ink outline-none focus:border-ink"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-paper disabled:opacity-40"
              >
                &uarr;
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
