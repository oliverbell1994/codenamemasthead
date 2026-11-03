"use client";
import { useState } from "react";
import { FIELDS, SECTORS, getPath, setPath, isFilled, progress, toYaml, type Brief, type FieldDef, type Ref, type Product } from "@/lib/brief";

type Props = { brief: Brief; onChange: (b: Brief) => void; asking: string };

function Tags({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => { const v = draft.trim(); if (!v) return; onChange([...value, v]); setDraft(""); };
  return (
    <div>
      {value.length > 0 && <div className="tags">{value.map((t, i) => <span className="tag" key={i}>{t}<button type="button" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button></span>)}</div>}
      <div className="addrow"><input type="text" value={draft} placeholder={placeholder || "Add"} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} /><button type="button" onClick={add}>Add</button></div>
    </div>
  );
}

function Refs({ value, onChange }: { value: Ref[]; onChange: (v: Ref[]) => void }) {
  const rows = value.length ? value : [];
  const set = (i: number, k: keyof Ref, v: string) => { const next = rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)); onChange(next); };
  return (
    <div>
      {rows.map((r, i) => (
        <div className="refrow" key={i}>
          <input type="text" value={r.url} placeholder="https://" onChange={(e) => set(i, "url", e.target.value)} />
          <input type="text" value={r.why} placeholder="why" onChange={(e) => set(i, "why", e.target.value)} />
          <button type="button" aria-label="Remove" onClick={() => onChange(rows.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      <div className="addrow"><button type="button" onClick={() => onChange([...rows, { url: "", why: "" }])}>Add a site</button></div>
    </div>
  );
}

function Products({ value, onChange, currency }: { value: Product[]; onChange: (v: Product[]) => void; currency: string }) {
  const set = (i: number, k: keyof Product, v: string) => onChange(value.map((p, j) => (j === i ? { ...p, [k]: v } : p)));
  return (
    <div>
      {value.map((p, i) => (
        <div className="prodrow" key={i}>
          <input type="text" value={p.name} placeholder="Product" onChange={(e) => set(i, "name", e.target.value)} />
          <input type="text" value={p.variant} placeholder="5 mg" onChange={(e) => set(i, "variant", e.target.value)} />
          <input type="text" value={p.price} placeholder={currency} onChange={(e) => set(i, "price", e.target.value)} />
          <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      <div className="addrow"><button type="button" onClick={() => onChange([...value, { name: "", variant: "", price: "" }])}>Add a product</button></div>
    </div>
  );
}

function Field({ f, brief, onChange, asking }: { f: FieldDef; brief: Brief; onChange: (b: Brief) => void; asking: string }) {
  const v = getPath(brief, f.path);
  const set = (nv: unknown) => onChange(setPath(brief, f.path, nv));
  const filled = isFilled(brief, f);
  return (
    <div className={"field" + (asking === f.path ? " asking" : "")} id={"f-" + f.path.replace(/\./g, "-")}>
      <div className="lbl"><span>{f.label}</span>{f.required && <span className={filled ? "ok" : "req"}>{filled ? "set" : "needed"}</span>}</div>
      {f.type === "text" && <input type="text" value={String(v ?? "")} placeholder="—" onChange={(e) => set(e.target.value)} />}
      {f.type === "textarea" && <textarea value={String(v ?? "")} placeholder="—" onChange={(e) => set(e.target.value)} />}
      {f.type === "sector" && (
        <select value={String(v ?? "")} onChange={(e) => set(e.target.value)}>
          <option value="">— choose —</option>
          {Object.entries(SECTORS).map(([k, s]) => <option key={k} value={k}>{k} · {s.title}</option>)}
        </select>
      )}
      {f.type === "choice" && (
        <select value={String(v ?? "default")} onChange={(e) => set(e.target.value)}>
          {(f.options || []).map((o) => <option key={o} value={o}>{o}{o === "default" && brief.start.sector ? ` (${sectorDefault(brief, f.path)})` : ""}</option>)}
        </select>
      )}
      {f.type === "bool" && (
        <div className="switch"><button type="button" className={v ? "on" : ""} onClick={() => set(true)}>Yes</button><button type="button" className={!v ? "on" : ""} onClick={() => set(false)}>No</button></div>
      )}
      {f.type === "tags" && <Tags value={(v as string[]) || []} onChange={set} />}
      {f.type === "refs" && <Refs value={(v as Ref[]) || []} onChange={set} />}
      {f.type === "products" && <Products value={(v as Product[]) || []} onChange={set} currency={brief.catalogue.currency} />}
    </div>
  );
}

function sectorDefault(b: Brief, path: string): string {
  const s = SECTORS[b.start.sector]; if (!s) return "";
  if (path.endsWith("light_or_dark")) return s.light; if (path.endsWith("density")) return s.density; return s.imagery;
}

export default function BriefPanel({ brief, onChange, asking }: Props) {
  const [showYaml, setShowYaml] = useState(false);
  const stages: FieldDef["stage"][] = ["Start", "Brand", "Catalogue", "Protect"];
  const pct = Math.round(progress(brief) * 100);
  const copy = async () => { try { await navigator.clipboard.writeText(toYaml(brief)); } catch { setShowYaml(true); } };
  return (
    <div className="pane-b">
      <div className="progress"><i style={{ width: pct + "%" }} /></div>
      <div className="brief">
        {stages.map((st) => {
          if (st === "Protect" && brief.meta.blind_test) return null;
          const fs = FIELDS.filter((f) => f.stage === st);
          const done = fs.filter((f) => f.required).every((f) => isFilled(brief, f));
          return (
            <div className="stage" key={st}>
              <div className="stage-h"><span>{st}</span><span className="meta">{done ? "complete" : fs.filter((f) => f.required && !isFilled(brief, f)).length + " needed"}</span></div>
              {fs.map((f) => <Field key={f.path} f={f} brief={brief} onChange={onChange} asking={asking} />)}
            </div>
          );
        })}
        <div className="field">
          <div className="lbl"><span>Blind test (skips Protect)</span></div>
          <div className="switch"><button type="button" className={brief.meta.blind_test ? "on" : ""} onClick={() => onChange(setPath(brief, "meta.blind_test", true))}>Yes</button><button type="button" className={!brief.meta.blind_test ? "on" : ""} onClick={() => onChange(setPath(brief, "meta.blind_test", false))}>No</button></div>
        </div>
      </div>
      <div className="briefbar">
        <span className="hint">{pct}% of required answers</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn ghost" onClick={() => setShowYaml((s) => !s)}>{showYaml ? "Hide YAML" : "YAML"}</button>
          <button type="button" className="btn ghost" onClick={copy}>Copy</button>
        </div>
      </div>
      {showYaml && <div style={{ padding: 16 }}><pre className="yaml">{toYaml(brief)}</pre></div>}
    </div>
  );
}
