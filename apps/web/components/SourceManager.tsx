"use client";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Facebook, Plus, RefreshCw, Search, ShieldCheck, X } from "lucide-react";
import { initialSources } from "@/lib/data";

type DisplaySource={
  id:string;name:string;description:string;type:string;items:number;lastSync:string;status:string;active:boolean;watchEnabled:boolean;url?:string;server:boolean;
};
type Preflight={ok:boolean;normalizedUrl?:string;accessibilityStatus?:string;actorConfigured?:boolean;note?:string;error?:string};
type Estimate={estimatedUsd:number;capped:number;maxPerRun:number;disclaimer:string};
type Form={name:string;url:string;mode:"discovery"|"targeted";resultsLimit:number;keyword:string;watchEnabled:boolean};
const LS_KEY="cse:v0.3:demo-sources";
const emptyForm:Form={name:"",url:"",mode:"discovery",resultsLimit:500,keyword:"",watchEnabled:true};

export function SourceManager(){
  const [sources,setSources]=useState<DisplaySource[]>([]);
  const [serverMode,setServerMode]=useState(false);
  const [open,setOpen]=useState(false);
  const [form,setForm]=useState<Form>(emptyForm);
  const [preflight,setPreflight]=useState<Preflight|null>(null);
  const [estimate,setEstimate]=useState<Estimate|null>(null);
  const [busy,setBusy]=useState(false);
  const [toast,setToast]=useState("");
  const [jobs,setJobs]=useState<Record<string,string>>({});
  const [search,setSearch]=useState("");

  const demoSeed=()=>initialSources.map(s=>({id:s.id,name:s.name,description:s.description,type:s.type,items:s.items,lastSync:s.lastSync,status:s.status,active:s.active,watchEnabled:s.active,server:false}));
  const load=async(resumeJobs=false)=>{
    const status=await fetch("/api/system/status").then(r=>r.json()).catch(()=>({persistent:false}));
    setServerMode(Boolean(status.persistent));
    if(status.persistent){
      const payload=await fetch("/api/sources").then(r=>r.json());
      const mapped:DisplaySource[]=(payload.sources??[]).map((s:any)=>({
        id:s.source_id,name:s.name,description:s.normalized_url??`${s.platform} source`,type:s.platform,
        items:Number(s.observation_count??0),lastSync:s.last_successful_sync_at?new Intl.RelativeTimeFormat("en",{numeric:"auto"}).format(Math.round((new Date(s.last_successful_sync_at).getTime()-Date.now())/60000),"minute"):"never",
        status:s.accessibility_status??"unverified",active:s.active!==false,watchEnabled:Boolean(s.watch_enabled),url:s.normalized_url,server:true
      }));
      setSources(mapped);
      if(resumeJobs){
        const pending=await fetch("/api/collections/pending").then(r=>r.json()).catch(()=>({jobs:[]}));
        for(const job of pending.jobs??[]){
          const name=job.sources?.name??"Facebook Group";
          setJobs(j=>({...j,[job.id]:job.status??"running"}));
          void pollJob(job.id,name);
        }
      }
    } else {
      const stored=localStorage.getItem(LS_KEY);
      setSources(stored?JSON.parse(stored):demoSeed());
    }
  };
  useEffect(()=>{void load(true);},[]);
  useEffect(()=>{if(!serverMode&&sources.length) localStorage.setItem(LS_KEY,JSON.stringify(sources));},[sources,serverMode]);
  const visible=useMemo(()=>sources.filter(s=>`${s.name} ${s.description}`.toLowerCase().includes(search.toLowerCase())),[sources,search]);

  const runPreflight=async()=>{
    setBusy(true);setPreflight(null);
    try{
      const res=await fetch("/api/sources/preflight",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({url:form.url})});
      const data=await res.json();setPreflight(data);
      if(data.ok){
        const e=await fetch("/api/collections/estimate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({resultsLimit:form.resultsLimit})}).then(r=>r.json());
        if(e.ok) setEstimate(e);
      }
    }finally{setBusy(false)}
  };

  const pollJob=async(jobId:string,sourceName:string)=>{
    for(let i=0;i<80;i++){
      await new Promise(r=>setTimeout(r,3000));
      const res=await fetch(`/api/collections/${jobId}/refresh`,{method:"POST"});
      const data=await res.json().catch(()=>({}));
      setJobs(j=>({...j,[jobId]:data.status??(res.ok?"running":"failed")}));
      if(data.terminal){
        setToast(data.status==="succeeded"?`${sourceName}: collection stored in Data Library`:`${sourceName}: collection ended ${data.status}`);
        setTimeout(()=>setToast(""),4000);await load(false);return;
      }
    }
    setJobs(j=>({...j,[jobId]:"check provider"}));
  };

  const save=async(collect:boolean)=>{
    if(!preflight?.ok){setToast("Run preflight before saving this Facebook Group.");setTimeout(()=>setToast(""),2500);return;}
    setBusy(true);
    try{
      if(serverMode){
        const sourceRes=await fetch("/api/sources",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:form.name||preflight.normalizedUrl,url:form.url,watchEnabled:form.watchEnabled,config:{collectionMode:form.mode}})});
        const sourceData=await sourceRes.json();
        if(!sourceRes.ok) throw new Error(sourceData.error||"Could not save source");
        if(collect){
          const jobRes=await fetch("/api/collections/start",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sourceId:sourceData.source.id,mode:form.mode,resultsLimit:form.resultsLimit,searchGroupKeyword:form.mode==="targeted"?form.keyword:undefined,viewOption:"CHRONOLOGICAL"})});
          const jobData=await jobRes.json();
          if(!jobRes.ok) throw new Error(jobData.error||"Could not start collection");
          setJobs(j=>({...j,[jobData.jobId]:"running"}));
          void pollJob(jobData.jobId,form.name||"Facebook Group");
        }
        await load(false);
      }else{
        const id=crypto.randomUUID();
        setSources(s=>[{id,name:form.name||"Facebook Group",description:preflight.normalizedUrl??form.url,type:"facebook",items:0,lastSync:"not collected",status:"unverified",active:true,watchEnabled:form.watchEnabled,url:preflight.normalizedUrl,server:false},...s]);
        if(collect){
          setJobs(j=>({...j,[id]:"demo queued"}));
          setTimeout(()=>setJobs(j=>({...j,[id]:"demo only · configure Supabase + Apify"})),900);
        }
      }
      setOpen(false);setForm(emptyForm);setPreflight(null);setEstimate(null);setToast(serverMode?"Source saved to Supabase":"Source saved in browser demo storage");setTimeout(()=>setToast(""),2600);
    }catch(error){setToast(error instanceof Error?error.message:String(error));setTimeout(()=>setToast(""),4200)}finally{setBusy(false)}
  };

  const toggle=async(s:DisplaySource)=>{
    const next=!s.active;setSources(all=>all.map(x=>x.id===s.id?{...x,active:next}:x));
    if(s.server) await fetch("/api/sources",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id:s.id,active:next})});
  };

  const sync=async(s:DisplaySource)=>{
    if(!s.server){setToast("Demo mode cannot collect real data. Configure Supabase + APIFY_TOKEN.");setTimeout(()=>setToast(""),2800);return;}
    setBusy(true);
    try{
      const res=await fetch("/api/collections/start",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sourceId:s.id,mode:"incremental",resultsLimit:500,viewOption:"CHRONOLOGICAL"})});
      const data=await res.json();if(!res.ok) throw new Error(data.error||"Sync failed to start");
      setJobs(j=>({...j,[data.jobId]:"running"}));void pollJob(data.jobId,s.name);setToast(`Incremental sync started for ${s.name}`);setTimeout(()=>setToast(""),2500);
    }catch(error){setToast(error instanceof Error?error.message:String(error));setTimeout(()=>setToast(""),3500)}finally{setBusy(false)}
  };

  return <>
    <div className="page-head">
      <div><div className="eyebrow">Real data acquisition</div><h1>Sources</h1><div className="subhead">Paste a public Facebook Group URL, verify the collection plan, then persist each run into the reusable Data Library.</div></div>
      <button className="btn primary" onClick={()=>setOpen(true)}><Plus size={16}/> Add Facebook Group</button>
    </div>
    <div className={`mode-banner ${serverMode?"good":"warn"}`}>
      {serverMode?<><CheckCircle2 size={18}/><div><b>Server persistence is active.</b><span> Source settings and collected evidence are stored in Supabase/PostgreSQL and survive refreshes.</span></div></>:<><AlertTriangle size={18}/><div><b>Demo persistence.</b><span> Source settings survive refreshes in this browser via localStorage, but real collected evidence requires Supabase + Apify credentials.</span></div></>}
    </div>
    <div className="toolbar section-space"><div className="search-box"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search sources…"/></div><span className="badge">{visible.length} SOURCES</span></div>
    <div className="grid equal">
      {visible.map(s=><div className="card source-card" key={s.id}>
        <div className="source-main"><div className="source-icon"><Facebook size={18}/></div><div><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><h3>{s.name}</h3><span className={`badge ${s.status==="accessible"||s.status==="healthy"?"green":s.status==="partial"||s.status==="attention"?"orange":""}`}>{s.status}</span>{s.watchEnabled&&<span className="badge purple">WATCH</span>}</div><p>{s.description}</p><div className="row-meta">{s.items.toLocaleString()} observations · last sync {s.lastSync}</div></div></div>
        <div className="source-actions"><button className="btn" disabled={busy} onClick={()=>sync(s)}><RefreshCw size={14}/> Sync new</button><button className={`switch ${s.active?"on":""}`} onClick={()=>toggle(s)} aria-label="Toggle source"><span/></button></div>
      </div>)}
    </div>
    {Object.keys(jobs).length>0&&<div className="card section-space"><div className="card-head"><div><h2>Collection jobs</h2><p>Jobs run asynchronously; refresh does not cancel provider work.</p></div></div><div className="list">{(Object.entries(jobs) as Array<[string,string]>).map(([id,status])=><div className="list-row" key={id}><div><div className="row-title mono">{id}</div><div className="row-meta">Provider job state</div></div><span className={`badge ${status==="succeeded"?"green":status.includes("fail")?"red":"orange"}`}>{status}</span></div>)}</div></div>}
    <div className="card section-space"><div className="card-head"><div><h2>Collection logic</h2><p>The engine never treats “public URL” as proof of complete access.</p></div></div><div className="pipeline"><Step n="01" t="URL preflight" d="Normalize and validate"/><Step n="02" t="Cost guardrail" d="Cap requested posts"/><Step n="03" t="Async collect" d="Apify run ID persists"/><Step n="04" t="Raw snapshot" d="Immutable Storage JSON"/><Step n="05" t="Deduplicate" d="IDs + content hash"/><Step n="06" t="Normalize" d="Anonymized observations"/><Step n="07" t="Coverage" d="Complete / partial / failed"/></div></div>

    {open&&<div className="modal-backdrop" onMouseDown={()=>setOpen(false)}><div className="modal wide" onMouseDown={e=>e.stopPropagation()}>
      <div className="modal-head"><div><div className="eyebrow">Facebook Group intake</div><h2>Add source + collection plan</h2><div className="subhead">Discovery collects broadly. Targeted mode filters for a defined hypothesis.</div></div><button className="icon-btn" onClick={()=>setOpen(false)}><X size={17}/></button></div>
      <div className="form-grid two-col">
        <label>Display name<input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. DIY Thailand"/></label>
        <label>Collection mode<select className="select" value={form.mode} onChange={e=>setForm({...form,mode:e.target.value as Form["mode"]})}><option value="discovery">Discovery — broad listening</option><option value="targeted">Targeted — keyword hypothesis</option></select></label>
        <label className="span-2">Facebook Group URL<input className="input" value={form.url} onChange={e=>{setForm({...form,url:e.target.value});setPreflight(null)}} placeholder="https://www.facebook.com/groups/..."/></label>
        <label>Maximum posts<input className="input" type="number" min={1} max={2000} value={form.resultsLimit} onChange={e=>{setForm({...form,resultsLimit:Number(e.target.value)});setEstimate(null)}}/></label>
        <label>Watch after first collection<select className="select" value={form.watchEnabled?"yes":"no"} onChange={e=>setForm({...form,watchEnabled:e.target.value==="yes"})}><option value="yes">Yes — incremental sync ready</option><option value="no">No — one-off research source</option></select></label>
        {form.mode==="targeted"&&<label className="span-2">Keyword filter<input className="input" value={form.keyword} onChange={e=>setForm({...form,keyword:e.target.value})} placeholder="e.g. สีลอก / waterproof / เขียนพลาสติก"/></label>}
      </div>
      <div className="preflight-panel">
        <div><ShieldCheck size={18}/><div><b>Preflight</b><div className="row-meta">Checks URL shape and connector capability. Actual accessibility is confirmed only after a real run.</div></div></div>
        <button className="btn" disabled={busy||!form.url} onClick={runPreflight}>{busy?"Checking…":"Check URL + estimate"}</button>
      </div>
      {preflight&&<div className={`result-panel ${preflight.ok?"ok":"error"}`}>{preflight.ok?<><CheckCircle2 size={18}/><div><b>{preflight.normalizedUrl}</b><div className="row-meta">Access: {preflight.accessibilityStatus} · Actor {preflight.actorConfigured?"configured":"not configured"}. {preflight.note}</div></div></>:<><AlertTriangle size={18}/><div><b>Preflight failed</b><div className="row-meta">{preflight.error}</div></div></>}</div>}
      {estimate&&<div className="estimate-grid"><div><span>Requested</span><b>{form.resultsLimit.toLocaleString()} posts</b></div><div><span>Guardrail cap</span><b>{estimate.capped.toLocaleString()}</b></div><div><span>Estimated provider cost</span><b>US${estimate.estimatedUsd.toFixed(2)}</b></div><div><span>Watch mode</span><b>{form.watchEnabled?"Ready":"Off"}</b></div><p className="span-4">{estimate.disclaimer}</p></div>}
      <div className="modal-actions"><button className="btn" disabled={busy||!preflight?.ok} onClick={()=>save(false)}>Save source only</button><button className="btn primary" disabled={busy||!preflight?.ok||!form.name} onClick={()=>save(true)}>{busy?"Working…":"Save + collect now"}</button></div>
    </div></div>}
    {toast&&<div className="toast">{toast}</div>}
  </>
}
function Step({n,t,d}:{n:string;t:string;d:string}){return <div className="pipeline-step"><span>{n}</span><b>{t}</b><small>{d}</small></div>}
