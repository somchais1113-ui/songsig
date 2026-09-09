import { ScoreRing } from "@/components/ScoreRing";
import { opportunities } from "@/lib/data";
export default function OpportunitiesPage(){return <div className="page">
 <div className="page-head"><div><div className="eyebrow">Decision support</div><h1>Opportunity Board</h1><div className="subhead">Prioritize what may be worth making, testing or communicating — not merely what is mentioned most.</div></div><button className="btn primary">Adjust scoring model</button></div>
 <div className="grid equal">{opportunities.map(o=><div className="card opportunity-card" key={o.id}>
  <div className="opportunity-top"><div><span className={`badge ${o.status==="Explore"?"green":o.status==="Validate"?"orange":"purple"}`}>{o.status}</span><h2 style={{marginTop:10,fontSize:21}}>{o.name}</h2><p className="subhead" style={{lineHeight:1.6}}>{o.note}</p></div><ScoreRing score={o.score}/></div>
  <div className="mini-grid"><div className="mini-metric"><b>{o.volume}</b><span>Volume</span></div><div className="mini-metric"><b>{o.growth}</b><span>Growth</span></div><div className="mini-metric"><b>{o.pain}</b><span>Pain</span></div><div className="mini-metric"><b>{o.unmet}</b><span>Unmet need</span></div></div>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:3}}><span className="row-meta">Score = Volume × Pain × Growth × Unmet Need · normalized</span><button className="btn">Open opportunity</button></div>
 </div>)}</div>
 </div>}
