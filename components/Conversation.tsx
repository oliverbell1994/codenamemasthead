"use client";
import { useEffect, useRef, useState } from "react";
import { FIELDS, SECTORS, getPath, setPath, type Brief, type FieldDef, type Ref, type Product } from "@/lib/brief";

export type ChatMsg = { role: "user" | "assistant" | "sys"; content: string; suggestions?: string[]; asking?: string };

type Props = {
  brief: Brief; messages: ChatMsg[]; model: string;
  onBrief: (b: Brief) => void; onMessages: (m: ChatMsg[]) => void; onAsking: (path: string) => void; onComplete: (c: boolean) => void;
  onGoPreview?: () => void;
};

const STAGES: FieldDef["stage"][] = ["Start", "Brand", "Catalogue", "Protect"];

export default function Conversation({ brief, messages, model, onBrief, onMessages, onAsking, onComplete, onGoPreview }: Props) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [started, setStarted] = useState(messages.length > 0);
  const [complete, setComplete] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const last = [...messages].reverse().find((m) => m.role === "assistant");
  const askingPath = last?.asking || "";
  const field = FIELDS.find((f) => f.path === askingPath);
  const stageIdx = field ? STAGES.indexOf(field.stage) : -1;
  const stageFields = field ? FIELDS.filter((f) => f.stage === field.stage) : [];
  const nInStage = field ? stageFields.indexOf(field) + 1 : 0;

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" }); }, [messages, busy]);
  useEffect(() => { if (!busy && field && (field.type === "text" || field.type === "textarea")) textRef.current?.focus(); }, [busy, askingPath, field]);

  async function send(text: string, nextBrief?: Brief) {
    const b = nextBrief ?? brief;
    if (nextBrief) onBrief(nextBrief);
    const content = text.trim();
    const history = messages.filter((m) => m.role !== "sys");
    const next: ChatMsg[] = content ? [...messages, { role: "user", content }] : messages;
    if (content) { onMessages(next); setDraft(""); }
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/converse", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: b, model, messages: (content ? [...history, { role: "user", content }] : history).map(({ role, content }) => ({ role, content })) }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.statusText);
      onBrief(j.brief); onAsking(j.asking || ""); onComplete(!!j.complete); setComplete(!!j.complete);
      onMessages([...next, { role: "assistant", content: j.say, suggestions: j.suggestions, asking: j.asking || "" }]);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  // Structured answer: patch the brief locally first, then tell the model in words.
  function answerStructured(value: unknown, said: string) {
    if (!field) return;
    const nb = setPath(brief, field.path, value);
    void send(said, nb);
  }
  function begin() { setStarted(true); void send(""); }
  function skip() { void send("Skip this for now."); }

  const transcript = messages.filter((m) => m.role !== "sys");
  const pairs: { q: string; a?: string }[] = [];
  for (const m of transcript) { if (m.role === "assistant") pairs.push({ q: m.content }); else if (pairs.length) pairs[pairs.length - 1].a = m.content; else pairs.push({ q: "", a: m.content }); }
  const earlier = pairs.slice(0, -1);

  return (
    <>
      <div className="pane-b">
        <div className="conv">
          {!model && <div className="status">Add your API key to <code>.env.local</code>, restart, and reload.</div>}

          {model && !started && (
            <div className="qcard intro">
              <div className="qstage">Before the first pixel</div>
              <h2>A short conversation, then three directions.</h2>
              <p>The engine asks one thing at a time, proposes the sensible default, and never asks what style you like. Anything it fills can be edited in the brief at any point.</p>
              <div className="qrow"><button type="button" className="btn sig" onClick={begin}>Begin</button><span className="hint">About ten minutes</span></div>
            </div>
          )}

          {earlier.length > 0 && (
            <div className="transcript">
              {earlier.map((p, i) => (
                <div className="tr" key={i}>
                  {p.q && <div className="tq">{p.q}</div>}
                  {p.a && <div className="ta">{p.a}</div>}
                </div>
              ))}
            </div>
          )}

          {last && !busy && (
            <div className="qcard" key={messages.length}>
              <div className="qstage">
                {field ? <>{field.stage} · {nInStage} of {stageFields.length}</> : complete ? "Complete" : "Masthead"}
                {stageIdx >= 0 && <span className="qdots">{STAGES.filter((s) => !(s === "Protect" && brief.meta.blind_test)).map((s, i) => <i key={s} className={i < stageIdx ? "done" : i === stageIdx ? "on" : ""} />)}</span>}
              </div>
              <h2>{last.content}</h2>
              {field?.help && <p className="qhelp">{field.help}</p>}

              {/* typed controls */}
              {field?.type === "sector" && (
                <div className="opts">
                  {Object.entries(SECTORS).map(([k, s]) => (
                    <button type="button" className="opt" key={k} onClick={() => answerStructured(k, `Sector ${k}: ${s.title}`)}>
                      <span className="k">{k}</span><span><b>{s.title}</b><small>{s.note}</small></span>
                    </button>
                  ))}
                </div>
              )}
              {field?.type === "bool" && (
                <div className="qrow">
                  <button type="button" className="btn" onClick={() => answerStructured(true, "Yes")}>Yes</button>
                  <button type="button" className="btn ghost" onClick={() => answerStructured(false, "No")}>No</button>
                </div>
              )}
              {field?.type === "choice" && (
                <div className="chips">{(field.options || []).map((o, i) => <button type="button" key={o} className={"chip" + (i === 0 ? " first" : "")} onClick={() => answerStructured(o, o)}>{o}</button>)}</div>
              )}
              {field?.type === "refs" && <RefsInput onDone={(rows) => answerStructured(rows, rows.map((r) => `${r.url}${r.why ? " (" + r.why + ")" : ""}`).join("; "))} />}
              {field?.type === "products" && <ProductsInput currency={brief.catalogue.currency} initial={(getPath(brief, field.path) as Product[]) || []} onDone={(rows) => answerStructured(rows, rows.map((p) => `${p.name} ${p.variant} ${p.price}`.trim()).join("; "))} />}
              {field?.type === "tags" && <TagsInput initial={(getPath(brief, field.path) as string[]) || []} onDone={(v) => answerStructured(v, v.join(", ") || "None")} />}

              {/* suggestions for free-text questions */}
              {(!field || field.type === "text" || field.type === "textarea") && last.suggestions && last.suggestions.length > 0 && (
                <div className="chips">{last.suggestions.map((s, j) => <button type="button" key={j} className={"chip" + (j === 0 ? " first" : "")} onClick={() => send(s)}>{s}</button>)}</div>
              )}

              {complete && !field && (
                <div className="qrow" style={{ marginTop: 14 }}>
                  <button type="button" className="btn sig" onClick={onGoPreview}>Generate three directions</button>
                  <span className="hint">or keep adding detail below</span>
                </div>
              )}
            </div>
          )}

          {busy && <div className="qcard thinking"><div className="qstage">Masthead</div><div className="dots"><i /><i /><i /></div></div>}
          {err && <div className="status err">{err}</div>}
          <div ref={endRef} />
        </div>
      </div>

      {started && (
        <div className="composer">
          <textarea
            ref={textRef}
            value={draft}
            placeholder={field ? (field.type === "text" || field.type === "textarea" ? "Type your answer" : "Or answer in words") : "Add anything else, or ask a question"}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!busy && draft.trim()) void send(draft); } }}
            disabled={!model || busy}
          />
          <div className="row">
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {field && !field.required && !busy && <button type="button" className="linkbtn" onClick={skip}>Skip for now</button>}
              <span className="hint">Enter to send</span>
            </div>
            <button type="button" className="btn" disabled={!model || busy || !draft.trim()} onClick={() => send(draft)}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

function RefsInput({ onDone }: { onDone: (rows: Ref[]) => void }) {
  const [rows, setRows] = useState<Ref[]>([{ url: "", why: "" }, { url: "", why: "" }, { url: "", why: "" }]);
  const set = (i: number, k: keyof Ref, v: string) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const valid = rows.filter((r) => r.url.trim());
  return (
    <div className="qform">
      {rows.map((r, i) => (
        <div className="refrow" key={i}>
          <input type="text" value={r.url} placeholder="https://" onChange={(e) => set(i, "url", e.target.value)} />
          <input type="text" value={r.why} placeholder="one word why" onChange={(e) => set(i, "why", e.target.value)} />
          <span />
        </div>
      ))}
      <div className="qrow"><button type="button" className="btn" disabled={!valid.length} onClick={() => onDone(valid)}>Continue</button><span className="hint">{valid.length} of 3</span></div>
    </div>
  );
}

function ProductsInput({ currency, initial, onDone }: { currency: string; initial: Product[]; onDone: (rows: Product[]) => void }) {
  const base = initial.length ? initial : Array.from({ length: 6 }, () => ({ name: "", variant: "", price: "" }));
  const [rows, setRows] = useState<Product[]>(base);
  const set = (i: number, k: keyof Product, v: string) => setRows(rows.map((p, j) => (j === i ? { ...p, [k]: v } : p)));
  const valid = rows.filter((p) => p.name.trim() && p.price.trim());
  return (
    <div className="qform">
      <div className="prodhead"><span>Product</span><span>Size</span><span>{currency}</span><span /></div>
      {rows.map((p, i) => (
        <div className="prodrow" key={i}>
          <input type="text" value={p.name} placeholder={i === 0 ? "e.g. BPC-157" : ""} onChange={(e) => set(i, "name", e.target.value)} />
          <input type="text" value={p.variant} placeholder={i === 0 ? "5 mg" : ""} onChange={(e) => set(i, "variant", e.target.value)} />
          <input type="text" value={p.price} placeholder={i === 0 ? "24.00" : ""} onChange={(e) => set(i, "price", e.target.value)} />
          <button type="button" aria-label="Remove" onClick={() => setRows(rows.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      <div className="qrow">
        <button type="button" className="btn" disabled={valid.length < 3} onClick={() => onDone(valid)}>Continue</button>
        <button type="button" className="linkbtn" onClick={() => setRows([...rows, { name: "", variant: "", price: "" }])}>Add a row</button>
        <span className="hint">{valid.length} with a price · at least 3, six is better</span>
      </div>
    </div>
  );
}

function TagsInput({ initial, onDone }: { initial: string[]; onDone: (v: string[]) => void }) {
  const [list, setList] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");
  const add = () => { const v = draft.trim(); if (!v) return; setList([...list, v]); setDraft(""); };
  return (
    <div className="qform">
      {list.length > 0 && <div className="tags">{list.map((t, i) => <span className="tag" key={i}>{t}<button type="button" aria-label="Remove" onClick={() => setList(list.filter((_, j) => j !== i))}>×</button></span>)}</div>}
      <div className="addrow"><input type="text" value={draft} placeholder="Type and press Enter" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} /><button type="button" onClick={add}>Add</button></div>
      <div className="qrow"><button type="button" className="btn" onClick={() => onDone(list)}>{list.length ? "Continue" : "None, continue"}</button></div>
    </div>
  );
}
