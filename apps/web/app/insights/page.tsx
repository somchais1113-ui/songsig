import { ArrowUpRight, Lightbulb } from "lucide-react";
import { insights } from "@/lib/data";
export default function InsightsPage(){return <div className="page">
 <div className="page-head"><div><div className="eyebrow">Evidence-backed knowledge</div><h1>Insight Library</h1><div className="subhead">Validated hypotheses with evidence strength, contradictions and source traceability.</div></div><button className="btn primary"><Lightbulb size={15}/> New research question</button></div>
 <div className="grid">{insights.map(i=><div className="card" key={i.id}>
  <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start"}}>
   <div style={{maxWidth:900}}><div style={{display:"flex",gap:8,alignItems:"center"}}><span className="mono">{i.id}</span><span className={`badge ${i.status==="Validated"?"green":"orange"}`}>{i.status}</span><span className="badge">{i.strength} evidence</span></div><h2 style={{fontSize:21,marginTop:12}}>{i.title}</h2><p className="subhead" style={{lineHeight:1.65}}>{i.summary}</p></div>
   <button className="icon-btn"><ArrowUpRight size={17}/></button>
  </div>
  <div className="mini-grid" style={{marginTop:16,maxWidth:650}}><div className="mini-metric"><b>{i.evidence}</b><span>Evidence</span></div><div className="mini-metric"><b>{i.communities}</b><span>Communities</span></div><div className="mini-metric"><b>{i.contradictions}</b><span>Contradictions</span></div><div className="mini-metric"><b>30d</b><span>Research window</span></div></div>
 </div>)}</div>
 </div>}
