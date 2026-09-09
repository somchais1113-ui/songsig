"use client";
import { useState } from "react";
import { Facebook, FileSpreadsheet, Plus, RefreshCw, Youtube } from "lucide-react";
import { initialSources } from "@/lib/data";

export function SourceManager(){
  const [sources,setSources]=useState(initialSources);
  const [open,setOpen]=useState(false);
  const [toast,setToast]=useState("");
  const toggle=(id:string)=>setSources(s=>s.map(x=>x.id===id?{...x,active:!x.active}:x));
  const sync=(name:string)=>{setToast(`Sync queued for ${name}`);setTimeout(()=>setToast(""),2200)};
  return <>
    <div className="page-head">
      <div><div className="eyebrow">Data acquisition</div><h1>Sources</h1><div className="subhead">Control what the engine listens to. Keep acquisition replaceable and analysis source-agnostic.</div></div>
      <button className="btn primary" onClick={()=>setOpen(true)}><Plus size={16}/> Add source</button>
    </div>
    <div className="grid equal">
      {sources.map(s=><div className="card source-card" key={s.id}>
        <div className="source-main">
          <div className="source-icon">{s.type==="facebook"?<Facebook size={18}/>:s.type==="youtube"?<Youtube size={18}/>:<FileSpreadsheet size={18}/>}</div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8}}><h3>{s.name}</h3><span className={`badge ${s.status==="healthy"?"green":s.status==="attention"?"orange":""}`}>{s.status}</span></div>
            <p>{s.description}</p>
            <div className="row-meta">{s.items.toLocaleString()} items · last sync {s.lastSync}</div>
          </div>
        </div>
        <div className="source-actions">
          <button className="btn" onClick={()=>sync(s.name)}><RefreshCw size={14}/> Sync</button>
          <button className={`switch ${s.active?"on":""}`} onClick={()=>toggle(s.id)} aria-label="Toggle source"><span/></button>
        </div>
      </div>)}
    </div>
    <div className="card section-space">
      <div className="card-head"><div><h2>Connector strategy</h2><p>Production rule: data acquisition can change without rewriting research logic.</p></div></div>
      <div className="grid three">
        <div><span className="badge">NOW</span><h3 style={{marginTop:10}}>Facebook Groups via Apify</h3><p className="subhead">Primary qualitative community source. Actor ID is configured through environment variables.</p></div>
        <div><span className="badge purple">IMPORT</span><h3 style={{marginTop:10}}>CSV / Manual observations</h3><p className="subhead">Safe fallback for private or restricted sources and research exports.</p></div>
        <div><span className="badge green">NEXT</span><h3 style={{marginTop:10}}>YouTube / Reddit</h3><p className="subhead">Add open-source conversation signals without changing the insight schema.</p></div>
      </div>
    </div>
    {open&&<div className="modal-backdrop" onMouseDown={()=>setOpen(false)}><div className="modal" onMouseDown={e=>e.stopPropagation()}>
      <div className="modal-head"><div><h2>Add data source</h2><div className="subhead">Prototype flow — production will persist this in Supabase.</div></div><button className="btn" onClick={()=>setOpen(false)}>Close</button></div>
      <div className="form-grid">
        <label>Source type<select className="select"><option>Facebook Group (Apify)</option><option>CSV / Excel</option><option>YouTube</option><option>Reddit</option></select></label>
        <label>Display name<input className="input" placeholder="e.g. DIY Thailand"/></label>
        <label>Group URL<input className="input" placeholder="https://facebook.com/groups/..."/></label>
        <label>Research note<textarea className="textarea" rows={4} placeholder="Why this community matters, keywords, exclusions..."/></label>
        <button className="btn primary" onClick={()=>{setOpen(false);setToast("Source configuration saved in prototype")}}>Save source</button>
      </div>
    </div></div>}
    {toast&&<div className="toast">{toast}</div>}
  </>
}
