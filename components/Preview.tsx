"use client";
import { useState } from "react";
import type { Brief } from "@/lib/brief";
import { missingRequired } from "@/lib/brief";
import type { Direction } from "@/app/api/directions/route";

type Props = {
  brief: Brief; model: string; complete: boolean;
  directions: Direction[]; chosen: string;
  onDirections: (d: Direction[]) => void; onChosen: (name: string) => void;
};

export default function Preview({ brief, model, complete, directions, chosen, onDirections, onChosen }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const missing = missingRequired(brief);

  async function generate() {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/directions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief, model }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.statusText);
      onDirections(j.directions); onChosen("");
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  const canGenerate = complete || missing.length === 0;

  return (
    <div className="pane-b">
      <div className="preview">
        {directions.length === 0 && (
          <div className="intro">
            <h2>{canGenerate ? "The brief is complete." : "Three directions, once the brief is complete."}</h2>
            <p>The engine plans three homepage directions from the brief, builds each as a full page, runs the design gate, fixes what fails, and shows you only what passes. You pick one; the other two are discarded. Expect a few minutes.</p>
            {!canGenerate && <div>
              <div className="hint" style={{ marginBottom: 6 }}>Still needed</div>
              {missing.map((m) => <div className="step" key={m.path}><i>·</i><span>{m.label}</span></div>)}
            </div>}
            {err && <div className="status err" style={{ marginTop: 12 }}>{err}</div>}
            <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
              <button type="button" className="btn sig" disabled={!canGenerate || busy || !model} onClick={generate}>{busy ? "Building three directions…" : "Generate three directions"}</button>
              {busy && <span className="hint">Planning, building three pages in parallel, gating, fixing. Two to five minutes.</span>}
            </div>
          </div>
        )}

        {directions.length > 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div className="hint">{chosen ? `Chosen: ${chosen}. The other two are discarded, never blended.` : "Pick one. Say one thing to change afterwards, not three."}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div className="switch"><button type="button" className={device === "desktop" ? "on" : ""} onClick={() => setDevice("desktop")}>Desktop</button><button type="button" className={device === "phone" ? "on" : ""} onClick={() => setDevice("phone")}>Phone</button></div>
                <button type="button" className="btn ghost" disabled={busy} onClick={generate}>{busy ? "Rebuilding…" : "Regenerate all three"}</button>
              </div>
            </div>
            {err && <div className="status err">{err}</div>}
            <div className="dirs">
              {directions.map((d) => (
                <div className={"dir" + (chosen === d.name ? " chosen" : "")} key={d.name}>
                  <div className="h"><b>{d.name}</b><span>{Object.entries(d.axes).map(([k, v]) => `${k}: ${v}`).join(" · ")}</span></div>
                  <div className="why">{d.why}</div>
                  <div className={"frame " + device}><iframe title={d.name} srcDoc={d.html} sandbox="allow-same-origin" /></div>
                  <div className="bar">
                    <div className="gate">
                      {d.gate.pass ? <span className="pass">Gate passed{d.attempts > 1 ? " after one fix" : ""}</span> : <span className="fail">Gate failed after a fix pass</span>}
                      {(d.gate.fails.length > 0 || d.gate.warns.length > 0) && (
                        <details><summary>{d.gate.fails.length} fail · {d.gate.warns.length} warn</summary>
                          <ul>{d.gate.fails.map((f, i) => <li key={"f" + i} className="fail">[{f.rule}] {f.msg}</li>)}{d.gate.warns.map((w, i) => <li key={"w" + i}>[{w.rule}] {w.msg}</li>)}</ul>
                        </details>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a className="btn ghost" href={"data:text/html;charset=utf-8," + encodeURIComponent(d.html)} download={`${brief.meta.slug || "brand"}-${d.name.toLowerCase()}.html`}>Download</a>
                      <button type="button" className={"btn" + (chosen === d.name ? " sig" : "")} onClick={() => onChosen(d.name)}>{chosen === d.name ? "Chosen" : "Choose this"}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {chosen && <div className="status">Next: chat-driven refinement of “{chosen}” with the gate on every edit. That is the next build; for now, download the chosen page and run it through <code>tools/gate.py</code> and <code>tools/screenshot.js</code> for the full checks.</div>}
          </>
        )}
      </div>
    </div>
  );
}
