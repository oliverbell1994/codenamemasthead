"use client";
import { useEffect, useState } from "react";
import { emptyBrief, type Brief } from "@/lib/brief";
import Conversation, { type ChatMsg } from "@/components/Conversation";
import BriefPanel from "@/components/BriefPanel";
import Preview from "@/components/Preview";
import type { Direction } from "@/app/api/directions/route";

type Saved = { brief: Brief; messages: ChatMsg[]; directions: Direction[]; chosen: string; asking: string };
const KEY = "masthead-studio-v1";

export default function Studio() {
  const [brief, setBrief] = useState<Brief>(emptyBrief());
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [chosen, setChosen] = useState("");
  const [asking, setAsking] = useState("");
  const [complete, setComplete] = useState(false);
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [converseModel, setConverseModel] = useState("");
  const [buildModel, setBuildModel] = useState("");
  const [modelErr, setModelErr] = useState("");
  const [tab, setTab] = useState<"chat" | "brief" | "preview">("chat");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) { const j = JSON.parse(s) as Saved; setBrief({ ...emptyBrief(), ...j.brief }); setMessages(j.messages || []); setDirections(j.directions || []); setChosen(j.chosen || ""); setAsking(j.asking || ""); } } catch {}
    setLoaded(true);
    fetch("/api/models").then((r) => r.json()).then((j) => {
      if (j.error) { setModelErr(j.error); return; }
      setModels(j.models || []); setConverseModel(j.defaults?.converse || ""); setBuildModel(j.defaults?.build || "");
    }).catch((e) => setModelErr(String(e)));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify({ brief, messages, directions, chosen, asking } as Saved)); } catch {}
  }, [brief, messages, directions, chosen, asking, loaded]);

  const reset = () => { setBrief(emptyBrief()); setMessages([]); setDirections([]); setChosen(""); setAsking(""); setComplete(false); try { localStorage.removeItem(KEY); } catch {} location.reload(); };

  return (
    <div className="studio">
      <div className="topbar">
        <div className="brand">Masthead <small>studio · v0.3</small></div>
        <div className="right">
          {modelErr ? <span style={{ color: "var(--bad)" }}>{modelErr}</span> : (
            <>
              <label>Chat <select value={converseModel} onChange={(e) => setConverseModel(e.target.value)}>{models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
              <label>Build <select value={buildModel} onChange={(e) => setBuildModel(e.target.value)}>{models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
            </>
          )}
          <button type="button" className="btn ghost" onClick={reset}>New brand</button>
        </div>
      </div>
      <div className="tabs">
        <button type="button" className={tab === "chat" ? "on" : ""} onClick={() => setTab("chat")}>Conversation</button>
        <button type="button" className={tab === "brief" ? "on" : ""} onClick={() => setTab("brief")}>Brief</button>
        <button type="button" className={tab === "preview" ? "on" : ""} onClick={() => setTab("preview")}>Directions</button>
      </div>
      <div className="panes">
        <section className={"pane" + (tab === "chat" ? " show" : "")}>
          <div className="pane-h"><span>Conversation</span><span className="meta">one question at a time</span></div>
          {loaded && <Conversation brief={brief} messages={messages} model={converseModel} onBrief={setBrief} onMessages={setMessages} onAsking={setAsking} onComplete={setComplete} />}
        </section>
        <section className={"pane" + (tab === "brief" ? " show" : "")}>
          <div className="pane-h"><span>Brief</span><span className="meta">edit anything, any time</span></div>
          <BriefPanel brief={brief} onChange={setBrief} asking={asking} />
        </section>
        <section className={"pane" + (tab === "preview" ? " show" : "")}>
          <div className="pane-h"><span>Directions</span><span className="meta">{directions.length ? `${directions.length} built` : "not yet"}</span></div>
          <Preview brief={brief} model={buildModel} complete={complete} directions={directions} chosen={chosen} onDirections={setDirections} onChosen={setChosen} />
        </section>
      </div>
    </div>
  );
}
