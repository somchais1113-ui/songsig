"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, Eye, RefreshCw, XCircle } from "lucide-react";

type Item={id:string;source:string;date:string;text:string;tags:string[];topic:string;intent:string;sentiment:string;pain:string;confidence:number;status:string};
const LS="cse:v0.3:demo-review";
export function ReviewQueue(){
 const [items,setItems]=useState<Item[]>([]);const [mode,setMode]=useState("");const [busy,setBusy]=useState("");
 const load=()=>fetch("/api/review?limit=30").then(r=>r.json()).then(d=>{let next=d.items??[];if(d.mode==="demo-local"){const saved=localStorage.getItem(LS);if(saved){const state=JSON.parse(saved) as Record<string,string>;next=next.map((i:Item)=>({...i,status:state[i.id]??i.status}))}}setItems(next);setMode(d.mode??"")});
 useEffect(()=>{void load()},[]);
 const act=async(id:string,status:"validated"|"watch"|"rejected")=>{
   setBusy(id);const prev=items;setItems(x=>x.map(i=>i.id===id?{...i,status}:i));
   if(mode==="demo-local"){
     const state=Object.fromEntries(items.map(i=>[i.id,i.id===id?status:i.status]));localStorage.setItem(LS,JSON.stringify(state));setBusy("");return;
   }
   const res=await fetch(`/api/observations/${id}/review`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status})});
   if(!res.ok) setItems(prev);setBusy("");
 };
 return <>
  <div className={`mode-banner ${mode==="supabase"?"good":"warn"}`}><CheckCircle2 size={18}/><div><b>{mode==="supabase"?"Review decisions persist in PostgreSQL":"Demo review state persists in this browser"}</b><span> · Validate / Watch / Reject is never supposed to reset just because the page refreshes.</span></div><button className="btn" onClick={load}><RefreshCw size={14}/> Reload</button></div>
  <div className="grid section-space">
  {items.map(item=><div className="card review-card" key={item.id}>
    <div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><span className="badge">{item.source}</span><span className="text-muted" style={{fontSize:12}}>{item.date}</span><span className={`badge ${item.status==="validated"?"green":item.status==="rejected"?"red":item.status==="watch"?"orange":""}`}>{item.status}</span></div>
      <p className="quote">“{item.text}”</p><div className="tag-row">{item.tags.map(t=><span className="badge purple" key={t}>{t}</span>)}</div>
      <div className="review-actions"><button disabled={busy===item.id} className="btn" onClick={()=>act(item.id,"validated")}><CheckCircle2 size={15}/> Validate</button><button disabled={busy===item.id} className="btn" onClick={()=>act(item.id,"watch")}><Eye size={15}/> Watch</button><button disabled={busy===item.id} className="btn danger" onClick={()=>act(item.id,"rejected")}><XCircle size={15}/> Reject</button></div>
    </div>
    <div className="review-side"><h3>AI classification</h3><div className="metric-line"><span>Topic</span><b>{item.topic}</b></div><div className="metric-line"><span>Intent</span><b>{item.intent}</b></div><div className="metric-line"><span>Sentiment</span><b>{item.sentiment}</b></div><div className="metric-line"><span>Pain intensity</span><b>{item.pain}</b></div><div className="metric-line"><span>Confidence</span><b>{item.confidence?`${item.confidence}%`:"Pending"}</b></div></div>
  </div>)}{items.length===0&&<div className="card empty">No observations are awaiting review.</div>}
  </div>
 </>
}
