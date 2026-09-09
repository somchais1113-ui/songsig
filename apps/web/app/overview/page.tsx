import { Activity, ArrowUpRight, Database, Lightbulb, Radar, Waypoints } from "lucide-react";
import { TrendChart } from "@/components/TrendChart";
import { opportunities, topics, initialSources } from "@/lib/data";

export default function Overview(){
 return <div className="page">
  <div className="page-head">
   <div><div className="eyebrow">Consumer intelligence</div><h1>Signal Overview</h1><div className="subhead">What changed, what matters, and where evidence is getting stronger.</div></div>
   <div style={{display:"flex",gap:8}}><button className="btn">Last 30 days</button><button className="btn primary"><Radar size={15}/> Explore signals</button></div>
  </div>
  <div className="grid kpis">
   <Kpi label="Total signals" value="12,482" delta="+18.4%" icon={<Radar size={17}/>}/>
   <Kpi label="Active topics" value="184" delta="+12" icon={<Activity size={17}/>}/>
   <Kpi label="Validated insights" value="31" delta="+6 this month" icon={<Lightbulb size={17}/>}/>
   <Kpi label="High-score opportunities" value="7" delta="+2" icon={<Waypoints size={17}/>}/>
  </div>
  <div className="grid two section-space">
    <div className="card">
      <div className="card-head"><div><h2>Conversation signal trend</h2><p>Normalized relevant observations after noise filtering</p></div><span className="badge green">+38% vs previous period</span></div>
      <TrendChart/>
    </div>
    <div className="card">
      <div className="card-head"><div><h2>What's changing</h2><p>Fastest-growing validated topics</p></div><ArrowUpRight size={17}/></div>
      <div className="list">{topics.map((t,i)=><div className="list-row" key={t.name}><div><div className="row-title">{t.name}</div><div className="row-meta">{t.count} supporting signals</div></div><div style={{textAlign:"right"}}><b style={{color:"#079455"}}>↑ {t.growth}%</b><div className="row-meta">growth</div></div></div>)}</div>
    </div>
  </div>
  <div className="grid equal section-space">
   <div className="card">
    <div className="card-head"><div><h2>Top opportunities</h2><p>Ranked by volume × pain × growth × unmet need</p></div></div>
    <div className="list">{opportunities.slice(0,4).map((o,i)=><div className="list-row" key={o.id}><div style={{display:"flex",alignItems:"center",gap:14}}><div className="rank">0{i+1}</div><div><div className="row-title">{o.name}</div><div className="row-meta">{o.note}</div></div></div><div className="score">{o.score}</div></div>)}</div>
   </div>
   <div className="card">
    <div className="card-head"><div><h2>Source health</h2><p>Acquisition status and signal volume</p></div><Database size={17}/></div>
    <div className="list">{initialSources.slice(0,4).map(s=><div className="list-row" key={s.id}><div className="source-line"><div className="source-icon"><Database size={15}/></div><div><div className="row-title">{s.name}</div><div className="row-meta">{s.items.toLocaleString()} items · {s.lastSync}</div></div></div><span className={`badge ${s.status==="healthy"?"green":"orange"}`}>{s.status}</span></div>)}</div>
   </div>
  </div>
  <div className="card section-space">
    <div className="card-head"><div><h2>Emerging weak signals</h2><p>Low-volume patterns worth watching before they become obvious</p></div></div>
    <div className="grid three">
      <Weak title="Marker for shoes" signal="+42%" note="Appearing across sneaker and art communities, still low volume."/>
      <Weak title="Outdoor signage touch-up" signal="+35%" note="Users seeking portable correction tools for weather-exposed signs."/>
      <Weak title="Dual nib request" signal="+23%" note="Growing feature language around switching between detail and fill work."/>
    </div>
  </div>
 </div>
}
function Kpi({label,value,delta,icon}:{label:string,value:string,delta:string,icon:React.ReactNode}){return <div className="card kpi"><div className="kpi-icon">{icon}</div><div className="label">{label}</div><div className="value">{value}</div><div className="delta">{delta}</div></div>}
function Weak({title,signal,note}:{title:string,signal:string,note:string}){return <div style={{border:"1px solid #e5ebf7",borderRadius:14,padding:15,background:"#fbfcff"}}><div style={{display:"flex",justifyContent:"space-between",gap:10}}><b>{title}</b><span className="badge green">{signal}</span></div><p className="subhead">{note}</p></div>}
