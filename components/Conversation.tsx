"use client";
import { useEffect, useRef, useState } from "react";
import type { Brief } from "@/lib/brief";

export type ChatMsg = { role: "user" | "assistant" | "sys"; content: string; suggestions?: string[] };

type Props = {
  brief: Brief;
  messages: ChatMsg[];
  model: string;
  onBrief: (b: Brief) => void;
  onMessages: (m: ChatMsg[]) => void;
  onAsking: (path: string) => void;
  onComplete: (c: boolean) => void;
};

export default function Conversation({ brief, messages, model, onBrief, onMessages, onAsking, onComplete }: Props) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages, busy]);

  async function send(text?: string) {
    const content = (text ?? draft).trim();
    const history = messages.filter((m) => m.role !== "sys");
    const next: ChatMsg[] = content ? [...messages, { role: "user", content }] : messages;
    if (content) { onMessages(next); setDraft(""); }
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/converse", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, model, messages: (content ? [...history, { role: "user", content }] : history).map(({ role, content }) => ({ role, content })) }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.statusText);
      onBrief(j.brief);
      onAsking(j.asking || "");
      onComplete(!!j.complete);
      onMessages([...next, { role: "assistant", content: j.say, suggestions: j.suggestions }]);
    } catch (e) {
      setErr((e as Error).message);
    } finally { setBusy(false); }
  }

  // Ask the first question once a model is known and the conversation is empty.
  useEffect(() => {
    if (!started.current && model && messages.filter((m) => m.role !== "sys").length === 0) { started.current = true; void send(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  const last = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <>
      <div className="pane-b">
        <div className="chat">
          {messages.length === 0 && !busy && <div className="msg sys"><div className="txt">{model ? "Starting." : "Add your API key to .env.local and restart to begin."}</div></div>}
          {messages.map((m, i) => (
            <div className={"msg " + m.role} key={i}>
              <div className="who">{m.role === "user" ? "You" : m.role === "assistant" ? "Masthead" : ""}</div>
              <div className="txt">{m.content}</div>
              {m === last && m.suggestions && m.suggestions.length > 0 && !busy && (
                <div className="chips">{m.suggestions.map((s, j) => <button type="button" key={j} className={"chip" + (j === 0 ? " first" : "")} onClick={() => send(s)}>{s}</button>)}</div>
              )}
            </div>
          ))}
          {busy && <div className="thinking">Thinking…</div>}
          {err && <div className="status err">{err}</div>}
          <div ref={endRef} />
        </div>
      </div>
      <div className="composer">
        <textarea
          value={draft}
          placeholder={model ? "Answer here, or tap a suggestion. You can also just edit the brief directly." : "Waiting for a model"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!busy && draft.trim()) void send(); } }}
          disabled={!model || busy}
        />
        <div className="row">
          <span className="hint">Enter to send · Shift+Enter for a new line</span>
          <button type="button" className="btn" disabled={!model || busy || !draft.trim()} onClick={() => send()}>Send</button>
        </div>
      </div>
    </>
  );
}
