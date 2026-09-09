"use client";
import { useEffect, useMemo, useState } from "react";
import { Archive, Database, Facebook, HardDrive, RefreshCw, Search } from "lucide-react";
import { initialSources } from "@/lib/data";

type LibrarySource={source_id:string;platform:string;name:string;normalized_url?:string;accessibility_status:string;active?:boolean;watch_enabled:boolean;last_successful_sync_at?:string;raw_item_count:number|string;observation_count:number|string;newest_observation_at?:string};
type LibraryPayload={ok:boolean;mode:string;totals:{observations:number;rawRecords:number;sources:number;rawBytes:number};sources:LibrarySource[]};
const fmtBytes=(n:number)=>n<1024?`${n} B`:n<1024**2?`${(n/1024).toFixed(1)} KB`:n<1024**3?`${(n/1024**2).toFixed(1)} MB`:`${(n/1024**3).toFixed(2)} GB`;
const fmtDate=(v?:string)=>v?new Intl.DateTimeFormat("en",{dateStyle:"medium",timeStyle:"short"}).format(new Date(v)):"Never";

export function DataLibrary(){
  const [payload,setPayload]=useState<LibraryPayload|null>(null);
  const [query,setQuery]=useState("");
  const [loading,setLoading]=useState(true);
  const load=()=>{setLoading(true);fetch("/api/library").then(r=>r.json()).then((data:LibraryPayload)=>{
    if(data.mode==="demo-local" && data.sources.length===0){
      data.sources=initialSources.map(s=>({source_id:s.id,platform:s.type,name:s.name,accessibility_status:s.status==="healthy"?"accessible":"partial",active:s.active,watch_enabled:s.active,last_successful_sync_at:new Date().toISOString(),raw_item_count:s.items,observation_count:Math.round(s.items*.82)}));
      data.totals.sources=data.sources.length;
    }
    setPayload(data);
  }).finally(()=>setLoading(false));};
  useEffect(load,[]);
  const sources=useMemo(()=>payload?.sources.filter(s=>s.name.toLowerCase().includes(query.toLowerCase()))??[],[payload,query]);
  return <>
    <div className="page-head">
      <div><div className="eyebrow">Persistent evidence base</div><h1>Data Library</h1><div className="subhead">Raw snapshots and normalized observations remain available across refreshes, sessions, and future research projects.</div></div>
      <button className="btn" onClick={load}><RefreshCw size={15}/> Refresh metrics</button>
    </div>
    <div className="grid kpis">
      <Metric label="Observations" value={(payload?.totals.observations??0).toLocaleString()} icon={<Database size={17}/>} note="Normalized research units"/>
      <Metric label="Raw records" value={(payload?.totals.rawRecords??0).toLocaleString()} icon={<Archive size={17}/>} note="Immutable evidence rows"/>
      <Metric label="Sources" value={(payload?.totals.sources??0).toLocaleString()} icon={<Facebook size={17}/>} note="Reusable across projects"/>
      <Metric label="Raw storage" value={fmtBytes(payload?.totals.rawBytes??0)} icon={<HardDrive size={17}/>} note={payload?.mode==="supabase"?"Supabase Storage":"Demo estimate"}/>
    </div>
    <div className="card section-space">
      <div className="card-head"><div><h2>Stored sources</h2><p>Research Projects reference this library; they do not duplicate or recollect the underlying data.</p></div><span className={`badge ${payload?.mode==="supabase"?"green":"orange"}`}>{payload?.mode==="supabase"?"SERVER PERSISTENT":"DEMO LOCAL"}</span></div>
      <div className="toolbar"><div className="search-box"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search source…"/></div></div>
      <div className="table-wrap"><table><thead><tr><th>Source</th><th>Access</th><th>Raw</th><th>Observations</th><th>Watch</th><th>Last successful sync</th></tr></thead><tbody>
        {sources.map(s=><tr key={s.source_id}><td><div className="source-line"><div className="source-icon"><Facebook size={15}/></div><div><div className="row-title">{s.name}</div><div className="row-meta">{s.platform} · {s.normalized_url??"imported dataset"}</div></div></div></td><td><span className={`badge ${s.accessibility_status==="accessible"?"green":s.accessibility_status==="partial"?"orange":""}`}>{s.accessibility_status}</span></td><td>{Number(s.raw_item_count).toLocaleString()}</td><td><b>{Number(s.observation_count).toLocaleString()}</b></td><td>{s.watch_enabled?<span className="badge purple">WATCHING</span>:<span className="text-muted">Off</span>}</td><td className="text-muted">{fmtDate(s.last_successful_sync_at)}</td></tr>)}
        {!loading&&sources.length===0&&<tr><td colSpan={6}><div className="empty">No stored source matches this filter.</div></td></tr>}
      </tbody></table></div>
    </div>
    <div className="grid equal section-space">
      <div className="card"><div className="card-head"><div><h2>Persistence contract</h2><p>What survives a browser refresh.</p></div></div><div className="list">
        <Line title="Raw provider snapshot" meta="Supabase Storage · immutable JSON"/>
        <Line title="Raw evidence rows" meta="PostgreSQL · deduplicated by source + content hash"/>
        <Line title="Normalized observations" meta="PostgreSQL · anonymized analysis units"/>
        <Line title="Embeddings / tags / clusters" meta="PostgreSQL + pgvector"/>
        <Line title="Insights / evidence / opportunities" meta="Knowledge Base · updated, not regenerated from zero"/>
      </div></div>
      <div className="card"><div className="card-head"><div><h2>Reuse model</h2><p>One data asset, many research questions.</p></div></div><div className="reuse-flow"><span>DATA LIBRARY</span><b>→</b><span>Paint Marker</span><span>DIY Behaviour</span><span>Competitor Scan</span><span>2027 Planning</span></div><p className="subhead">A new project creates filters and evidence links. It does not copy 200,000 observations or scrape the same Facebook Group again.</p></div>
    </div>
  </>
}
function Metric({label,value,icon,note}:{label:string;value:string;icon:React.ReactNode;note:string}){return <div className="card kpi"><div className="kpi-icon">{icon}</div><div className="label">{label}</div><div className="value">{value}</div><div className="row-meta">{note}</div></div>}
function Line({title,meta}:{title:string;meta:string}){return <div className="list-row"><div><div className="row-title">{title}</div><div className="row-meta">{meta}</div></div><span className="badge green">PERSIST</span></div>}
