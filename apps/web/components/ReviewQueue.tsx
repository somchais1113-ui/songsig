"use client";
import { useState } from "react";
import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { reviewSignals } from "@/lib/data";

export function ReviewQueue(){
 const [items,setItems]=useState(reviewSignals);
 const act=(id:string,status:string)=>setItems(x=>x.map(i=>i.id===id?{...i,status}:i));
 return <div className="grid">
  {items.map(item=><div className="card review-card" key={item.id}>
    <div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}><span className="badge">{item.source}</span><span className="text-muted" style={{fontSize:12}}>{item.date}</span><span className={`badge ${item.status==="validated"?"green":item.status==="rejected"?"red":item.status==="watch"?"orange":""}`}>{item.status}</span></div>
      <p className="quote">“{item.text}”</p>
      <div className="tag-row">{item.tags.map(t=><span className="badge purple" key={t}>{t}</span>)}</div>
      <div className="review-actions">
        <button className="btn" onClick={()=>act(item.id,"validated")}><CheckCircle2 size={15}/> Validate</button>
        <button className="btn" onClick={()=>act(item.id,"watch")}><Eye size={15}/> Watch</button>
        <button className="btn danger" onClick={()=>act(item.id,"rejected")}><XCircle size={15}/> Reject</button>
      </div>
    </div>
    <div className="review-side">
      <h3>AI classification</h3>
      <div className="metric-line"><span>Topic</span><b>{item.topic}</b></div>
      <div className="metric-line"><span>Intent</span><b>{item.intent}</b></div>
      <div className="metric-line"><span>Sentiment</span><b>{item.sentiment}</b></div>
      <div className="metric-line"><span>Pain intensity</span><b>{item.pain}</b></div>
      <div className="metric-line"><span>Confidence</span><b>{item.confidence}%</b></div>
    </div>
  </div>)}
 </div>
}
