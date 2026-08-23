"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Alert, Badge, Button, ChatIcon, CloseIcon, Input } from "@/components/ui";

type Message = { role: "user" | "assistant"; content: string; urgent?: boolean };

const SAMPLES = [
  "What does haemoglobin mean?",
  "HbA1c 7.8 % ಅಂದರೆ ಏನು?",
  "What is a reference range?",
  "नज़दीकी अस्पताल कैसे खोजूँ?",
  "I have chest pain",
];

export function Assistant({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaskara. I am the GramaCare Assistant. I can explain health words and report values, and help you find healthcare, medicines or blood near you. Ask me in Kannada, Hindi or English.",
    },
  ]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setValue("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setBusy(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });
      const data = (await response.json()) as { reply?: string; urgent?: boolean; error?: string };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ??
            data.error ??
            "We couldn't answer right now. Please try again, or use Find Care to locate a health centre.",
          urgent: data.urgent,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "You appear to be offline. Please try again when you have a connection." },
      ]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/45 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("assistant.title")}
        className="flex h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:h-[76vh] sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-brand-600 px-4 py-3 text-white">
          <div className="flex items-center gap-2.5">
            <ChatIcon />
            <div>
              <p className="font-bold">{t("assistant.title")}</p>
              <p className="text-xs text-brand-100">{t("assistant.subtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="press rounded-lg p-2 hover:bg-white/15"
          >
            <CloseIcon />
          </button>
        </div>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-canvas px-4 py-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-[92%] rounded-2xl px-4 py-3 text-[0.95rem] leading-relaxed ${
                message.role === "user"
                  ? "ml-auto bg-brand-600 text-white"
                  : message.urgent
                    ? "border border-red-300 bg-red-50 text-red-900"
                    : "border border-slate-200 bg-white text-ink-900"
              }`}
            >
              {message.content}
            </div>
          ))}
          {busy ? (
            <div className="w-24 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="inline-flex gap-1" aria-label="typing">
                <span className="size-2 animate-bounce rounded-full bg-brand-400" />
                <span className="size-2 animate-bounce rounded-full bg-brand-400 [animation-delay:120ms]" />
                <span className="size-2 animate-bounce rounded-full bg-brand-400 [animation-delay:240ms]" />
              </span>
            </div>
          ) : null}
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          <div className="mb-2 flex gap-2 overflow-x-auto hide-scrollbar">
            {SAMPLES.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => send(sample)}
                className="press min-h-9 shrink-0 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-ink-700 hover:bg-slate-50"
              >
                {sample}
              </button>
            ))}
          </div>
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void send(value);
            }}
          >
            <label htmlFor="assistant-input" className="sr-only">
              {t("assistant.placeholder")}
            </label>
            <Input
              id="assistant-input"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={t("assistant.placeholder")}
              autoComplete="off"
            />
            <Button type="submit" disabled={busy || value.trim().length === 0}>
              {t("assistant.send")}
            </Button>
          </form>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[0.7rem] text-ink-400">
            <Badge tone="warning">Info only</Badge>
            {t("assistant.disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AssistantNotice() {
  const { t } = useI18n();
  return <Alert tone="warning" title={t("assistant.title")}>{t("assistant.disclaimer")}</Alert>;
}
