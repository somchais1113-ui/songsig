import { AlertTriangle, CheckCircle2, FlaskConical, Layers3, SearchCheck } from "lucide-react";
import { evidence } from "@/lib/data";

export default function ResearchPage(){return <div className="page">
 <div className="page-head"><div><div className="eyebrow">Research workspace</div><h1>Paint Marker Opportunity</h1><div className="subhead">Cross-community evidence synthesis · 30-day window</div></div><div style={{display:"flex",gap:8}}><button className="btn">Change scope</button><button className="btn primary">Run analysis</button></div></div>
 <div className="card research-hero">
  <div className="grid two">
   <div><span className="badge">AI HYPOTHESIS · HUMAN VALIDATION REQUIRED</span><div className="hypothesis">Consumers may value <span style={{color:"#7cd4fd"}}>surface confidence</span> more than additional color variety.</div><div className="subhead">Evidence indicates users struggle to predict whether a marker will actually remain on their material. The opportunity may be a performance + compatibility system, not simply more SKUs.</div></div>
   <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:28}}><div><div className="research-score">84</div><div className="subhead">Signal strength / 100</div></div></div>
  </div>
 </div>
 <div className="grid kpis section-space">
  <Mini label="Evidence" value="184" icon={<SearchCheck size={17}/>} sub="supporting observations"/>
  <Mini label="Communities" value="12" icon={<Layers3 size={17}/>} sub="cross-source validation"/>
  <Mini label="Pain points" value="31" icon={<AlertTriangle size={17}/>} sub="high / medium intensity"/>
  <Mini label="Growth" value="+38%" icon={<FlaskConical size={17}/>} sub="vs previous period"/>
 </div>
 <div className="grid two section-space">
  <div className="card">
    <div className="card-head"><div><h2>Evidence structure</h2><p>Why the hypothesis exists</p></div></div>
    {[
      ["Plastic adhesion",92,"Repeated complaints across DIY, models and automotive communities"],
      ["Waterproof permanence",81,"Outdoor users interpret permanence as weather durability"],
      ["Surface compatibility uncertainty",88,"Users repeatedly ask which marker works on which material"],
      ["Color expansion demand",39,"High mentions, but low pain and low unmet-need intensity"]
    ].map(([name,score,note])=><div className="list-row" key={String(name)}><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between"}}><b>{name}</b><b>{score}</b></div><div className="progress" style={{margin:"8px 0 5px"}}><span style={{width:`${score}%`}}/></div><div className="row-meta">{note}</div></div></div>)}
  </div>
  <div className="card challenger">
    <div className="card-head"><div><h2>AI Challenger</h2><p>Attempts to falsify the current hypothesis</p></div><AlertTriangle size={18}/></div>
    <div className="challenger-item"><b>Brand concentration risk</b><p className="subhead">43% of adhesion complaints originate from only two marker brands. Category-level conclusion may be premature.</p></div>
    <div className="challenger-item"><b>Usage error may contribute</b><p className="subhead">A meaningful subset does not mention cleaning, priming, drying time or surface preparation.</p></div>
    <div className="challenger-item"><b>Sampling bias</b><p className="subhead">DIY communities currently contribute more evidence than professional fabrication communities.</p></div>
    <div className="review-actions"><button className="btn">Watch</button><button className="btn">Request more evidence</button><button className="btn primary"><CheckCircle2 size={15}/> Validate hypothesis</button></div>
  </div>
 </div>
 <div className="card section-space">
  <div className="card-head"><div><h2>Traceable evidence</h2><p>Original observations remain accessible behind every insight.</p></div><span className="badge green">Evidence integrity on</span></div>
  <div className="table-wrap"><table><thead><tr><th>Original observation</th><th>Source</th><th>Cluster</th></tr></thead><tbody>{evidence.map((e,i)=><tr key={i}><td style={{fontWeight:650}}>“{e.quote}”</td><td>{e.source}</td><td><span className="badge purple">{e.cluster}</span></td></tr>)}</tbody></table></div>
 </div>
 </div>}
function Mini({label,value,icon,sub}:{label:string,value:string,icon:React.ReactNode,sub:string}){return <div className="card kpi"><div className="kpi-icon">{icon}</div><div className="label">{label}</div><div className="value">{value}</div><div className="row-meta">{sub}</div></div>}
