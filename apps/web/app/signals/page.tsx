"use client";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { signals } from "@/lib/data";

export default function SignalsPage(){
 const [q,setQ]=useState(""); const [topic,setTopic]=useState("All topics");
 const rows=useMemo(()=>signals.filter(s=>(s.text+s.source+s.topic).toLowerCase().includes(q.toLowerCase())&&(topic==="All topics"||s.topic===topic)),[q,topic]);
 const topics=["All topics",...Array.from(new Set(signals.map(s=>s.topic)))];
 return <div className="page">
  <div className="page-head"><div><div className="eyebrow">Evidence browser</div><h1>Raw Signals</h1><div className="subhead">Search normalized observations before they become summaries or insights.</div></div><button className="btn primary">Export filtered data</button></div>
  <div className="toolbar"><div style={{position:"relative"}}><Search size={15} style={{position:"absolute",left:12,top:12,color:"#667085"}}/><input className="input" style={{paddingLeft:36}} placeholder="Search conversations..." value={q} onChange={e=>setQ(e.target.value)}/></div><select className="select" value={topic} onChange={e=>setTopic(e.target.value)}>{topics.map(t=><option key={t}>{t}</option>)}</select><button className="btn"><SlidersHorizontal size={15}/> More filters</button><span className="badge">{rows.length} results</span></div>
  <div className="table-wrap"><table><thead><tr><th>Signal</th><th>Source</th><th>Topic</th><th>Intent</th><th>Pain</th><th>Engagement</th></tr></thead><tbody>{rows.map(s=><tr key={s.id}><td style={{minWidth:420}}><div className="mono">{s.id}</div><div style={{marginTop:5,fontWeight:650,lineHeight:1.45}}>{s.text}</div><div className="tag-row">{s.tags.map(t=><span className="badge purple" key={t}>{t}</span>)}</div></td><td><b>{s.source}</b><div className="row-meta">{s.date}</div></td><td>{s.topic}</td><td>{s.intent}<div className="row-meta">{s.sentiment}</div></td><td><span className={`badge ${s.pain==="High"?"red":s.pain==="Medium"?"orange":"green"}`}>{s.pain}</span></td><td><b>{s.engagement}</b></td></tr>)}</tbody></table></div>
 </div>
}
