"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cleanPlainText, parseCleanTextBlocks, type CleanTextBlock } from "@/lib/ai/ai-text-sanitizer";

interface ChatActionChip {
  id: string;
  label: string;
  action: string;
  payload: Record<string, any>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  actions?: ChatActionChip[];
  hasProPrompt?: boolean;
}

/**
 * Clean Assistant Message Component
 * Renders structured headings, paragraphs, and lists without raw Markdown asterisks, hashes, or dashes.
 */
function CleanMessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <p className="whitespace-pre-wrap">{cleanPlainText(content)}</p>;
  }

  const blocks: CleanTextBlock[] = parseCleanTextBlocks(content);

  return (
    <div className="space-y-2 text-xs leading-relaxed text-ink">
      {blocks.map((block, idx) => {
        if (block.type === "heading") {
          return (
            <h4 key={idx} className="font-semibold text-ink text-xs pt-1 border-b border-paper-line/50 pb-0.5 tracking-tight">
              {block.content}
            </h4>
          );
        }
        if (block.type === "subheading") {
          return (
            <h5 key={idx} className="font-semibold text-ink-soft text-xs pt-0.5">
              {block.content}
            </h5>
          );
        }
        if (block.type === "bullet_list") {
          return (
            <ul key={idx} className="space-y-1 pl-1">
              {block.items?.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-1.5 text-xs text-ink-soft">
                  <span className="text-amber-800 font-bold select-none">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "numbered_list") {
          return (
            <ol key={idx} className="space-y-1.5 pl-1">
              {block.items?.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2 text-xs text-ink-soft">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-semibold text-amber-900 select-none">
                    {itemIdx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx} className="text-xs text-ink leading-relaxed">
            {block.content}
          </p>
        );
      })}
    </div>
  );
}

export function AIAssistantWidget({
  orgName,
  country,
  sector,
}: {
  orgName?: string;
  country?: string;
  sector?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello. I am your Grant OS Intelligence Assistant for ${
        orgName || "your organization"
      } in ${country || "Nigeria"}.

How can I support your grant strategy today? You can ask me to find verified grants, research strategic funders, evaluate your theory of change, or draft opportunity-specific proposals.`,
      actions: [
        { id: "init-1", label: "Find Matches", action: "search_grants", payload: { query: sector || "Technology" } },
        { id: "init-2", label: "AfDB Intelligence", action: "research_funder", payload: { funderName: "African Development Bank (AfDB)" } },
        { id: "init-3", label: "Theory of Change", action: "ask_concept", payload: { query: "What is a theory of change?" } },
      ],
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
            orgContext: {
              orgName: orgName || "My Organization",
              country: country || "Nigeria",
              sector: sector || "Technology",
            },
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.response) {
        const resp = data.data.response;
        const rawText = typeof resp === "string" ? resp : resp.message || "Grant intelligence retrieved.";
        const respText = cleanPlainText(rawText);
        const actions = Array.isArray(resp.actions) ? resp.actions : undefined;
        const hasProPrompt = respText.includes("Subscribe as a Pro user") || respText.includes("Pro subscriber");

        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: respText,
            actions,
            hasProPrompt,
          },
        ]);
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

  const handleActionClick = (action: ChatActionChip) => {
    if (action.action === "search_grants") {
      const q = action.payload?.query || "";
      router.push(`/database?q=${encodeURIComponent(q)}`);
      setIsOpen(false);
      return;
    }
    if (action.action === "start_proposal") {
      const type = action.payload?.type || "concept_note";
      router.push(`/proposals?type=${type}`);
      setIsOpen(false);
      return;
    }
    if (action.action === "research_funder") {
      const funder = action.payload?.funderName || "African Development Bank";
      handleSend(`Research this funder: ${funder}`);
      return;
    }
    if (action.action === "ask_concept") {
      handleSend(action.payload?.query || "What is a theory of change?");
      return;
    }
    if (action.action === "add_tracker" || action.action === "save_grant") {
      handleSend(`Add ${action.payload?.title || "this grant"} to my tracker pipeline.`);
      return;
    }
    // Default fallback
    handleSend(`Please proceed with ${action.label}`);
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
        <div className="fixed bottom-24 right-6 z-50 flex h-[580px] w-[390px] sm:w-[480px] flex-col overflow-hidden rounded-2xl border border-paper-line bg-paper-raised shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-paper-line bg-paper px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stamp-tint text-stamp-dark text-xs">
                ✨
              </span>
              <div>
                <h3 className="font-serif text-sm font-semibold text-ink">Grant OS Assistant</h3>
                <p className="text-[11px] text-ink-faint">
                  Active &bull; {orgName || "Organization Workspace"}
                </p>
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

          {/* Quick Prompts Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-paper-line/60 bg-paper/50 px-3 py-2 text-[11px] no-scrollbar">
            <button
              type="button"
              onClick={() => handleSend("Find verified grants for our sector")}
              className="whitespace-nowrap rounded-full border border-paper-line bg-amber-50 text-amber-900 font-medium px-2.5 py-1 hover:bg-amber-100"
            >
              Find Grants
            </button>
            <button
              type="button"
              onClick={() => handleSend("Research funder African Development Bank")}
              className="whitespace-nowrap rounded-full border border-paper-line bg-paper-raised px-2.5 py-1 text-ink-soft hover:bg-paper hover:text-ink"
            >
              Research Funder
            </button>
            <button
              type="button"
              onClick={() => handleSend("What is a theory of change?")}
              className="whitespace-nowrap rounded-full border border-paper-line bg-paper-raised px-2.5 py-1 text-ink-soft hover:bg-paper hover:text-ink"
            >
              Theory of Change
            </button>
            <button
              type="button"
              onClick={() => handleSend("Only non-dilutive funding above $50,000")}
              className="whitespace-nowrap rounded-full border border-paper-line bg-paper-raised px-2.5 py-1 text-ink-soft hover:bg-paper hover:text-ink"
            >
              Refine Matches
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-ink text-paper"
                      : "border border-paper-line bg-paper shadow-sm"
                  }`}
                >
                  <CleanMessageContent content={m.content} isUser={m.role === "user"} />

                  {/* Interactive Action Chips */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-paper-line/60">
                      {m.actions.map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className="rounded-lg border border-amber-300 bg-amber-50/90 px-2.5 py-1 text-[11px] font-semibold text-amber-950 hover:bg-amber-100 transition-colors shadow-xs"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.hasProPrompt && (
                  <div className="mt-1.5 max-w-[90%] rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-[11px] text-amber-950 flex items-center justify-between gap-2 shadow-sm">
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
                <div className="rounded-2xl border border-paper-line bg-paper px-3.5 py-2 text-xs text-ink-faint flex items-center gap-2">
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Grant OS analyzing funder intelligence…</span>
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
                placeholder="Ask about grants, funders, proposals, budgets…"
                className="flex-1 rounded-xl border border-paper-line bg-paper-raised px-3 py-2 text-xs text-ink outline-none focus:border-ink"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-paper disabled:opacity-40 hover:bg-stamp-dark transition-colors"
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
