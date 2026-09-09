import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
  Database,
  FileCheck2,
  FlaskConical,
  Layers3,
  Lightbulb,
  Plus,
  Radar,
  ShieldCheck,
  Sparkles,
  Waypoints
} from "lucide-react";
import { TrendChart } from "@/components/TrendChart";
import { DashboardLiveSummary } from "@/components/DashboardLiveSummary";
import { initialSources, insights, topics } from "@/lib/data";

export default function DashboardPage(){
  return <div className="page dashboard-page">
    <div className="dashboard-hero">
      <div>
        <div className="eyebrow">Executive dashboard</div>
        <h1>Good morning. Here&apos;s what your consumer evidence is telling you.</h1>
        <p className="subhead">A high-level operating view before you enter the detailed signal workspace.</p>
      </div>
      <div className="dashboard-hero-actions">
        <Link className="btn primary" href="/overview">Open signal workspace <ArrowRight size={15}/></Link>
      </div>
    </div>

    <DashboardLiveSummary/>

    <section className="dashboard-main-grid section-space">
      <div className="card dashboard-trend-card">
        <div className="card-head">
          <div><h2>Signal velocity</h2><p>Relevant observations entering the knowledge base</p></div>
          <span className="badge green">+38% vs previous period</span>
        </div>
        <TrendChart/>
        <div className="dashboard-trend-footer">
          <div><span>Fastest growth</span><b>Waterproof permanence</b><strong>↑ 81%</strong></div>
          <div><span>Cross-community</span><b>Plastic adhesion</b><strong>8 communities</strong></div>
          <div><span>Weak signal</span><b>Shoe customization</b><strong>Watch</strong></div>
        </div>
      </div>

      <div className="card priority-card">
        <div className="card-head"><div><h2>Decision priority</h2><p>What deserves attention now</p></div><Sparkles size={18}/></div>
        <div className="priority-score-wrap">
          <div className="priority-score"><span>91</span><small>/100</small></div>
          <div><span className="badge purple">EXPLORE</span><h3>Waterproof permanence</h3><p>Evidence is strengthening across multiple communities and use cases.</p></div>
        </div>
        <div className="priority-metrics">
          <div><span>Evidence</span><b>184 signals</b></div>
          <div><span>Growth</span><b>+81%</b></div>
          <div><span>Pain</span><b>High</b></div>
          <div><span>Unmet need</span><b>96/100</b></div>
        </div>
        <Link href="/opportunities" className="btn full">Review opportunity evidence <ArrowRight size={15}/></Link>
      </div>
    </section>

    <section className="dashboard-three-grid section-space">
      <div className="card">
        <div className="card-head"><div><h2>What&apos;s changing</h2><p>Fast-moving topics</p></div><ArrowUpRight size={17}/></div>
        <div className="list dashboard-topic-list">
          {topics.slice(0,4).map((topic,index)=><div className="list-row" key={topic.name}>
            <div className="topic-index">0{index+1}</div>
            <div className="grow"><div className="row-title">{topic.name}</div><div className="row-meta">{topic.count} supporting signals</div></div>
            <b className="positive">↑ {topic.growth}%</b>
          </div>)}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div><h2>Source health</h2><p>Collection coverage at a glance</p></div><Database size={17}/></div>
        <div className="list">
          {initialSources.slice(0,4).map(source=><div className="list-row" key={source.id}>
            <div className="source-line"><div className="source-icon"><Database size={14}/></div><div><div className="row-title">{source.name}</div><div className="row-meta">{source.items.toLocaleString()} items · {source.lastSync}</div></div></div>
            <span className={`badge ${source.status==="healthy"?"green":"orange"}`}>{source.status}</span>
          </div>)}
        </div>
        <Link href="/sources" className="text-link dashboard-card-link">Manage sources <ArrowRight size={14}/></Link>
      </div>

      <div className="card">
        <div className="card-head"><div><h2>Research quality</h2><p>Evidence governance</p></div><ShieldCheck size={17}/></div>
        <div className="quality-stack">
          <QualityRow icon={<CheckCircle2 size={16}/>} label="Deduplication" value="99.2%" status="good"/>
          <QualityRow icon={<ShieldCheck size={16}/>} label="PII redaction" value="Enabled" status="good"/>
          <QualityRow icon={<FileCheck2 size={16}/>} label="Evidence lineage" value="Complete" status="good"/>
          <QualityRow icon={<CircleAlert size={16}/>} label="Stale insights" value="4" status="warn"/>
        </div>
        <Link href="/review" className="text-link dashboard-card-link">Open human review <ArrowRight size={14}/></Link>
      </div>
    </section>

    <section className="card section-space pipeline-overview-card">
      <div className="card-head"><div><h2>Intelligence pipeline</h2><p>Where evidence currently sits across the research workflow</p></div><Layers3 size={18}/></div>
      <div className="dashboard-pipeline">
        <PipelineStage icon={<Database size={17}/>} label="Collected" value="248K" note="Persistent evidence" tone="blue"/>
        <span className="pipeline-arrow">→</span>
        <PipelineStage icon={<BrainCircuit size={17}/>} label="AI structured" value="221K" note="89% complete" tone="cyan"/>
        <span className="pipeline-arrow">→</span>
        <PipelineStage icon={<ShieldCheck size={17}/>} label="Human reviewed" value="9,814" note="23 waiting now" tone="green"/>
        <span className="pipeline-arrow">→</span>
        <PipelineStage icon={<FlaskConical size={17}/>} label="Hypotheses" value="46" note="Research layer" tone="purple"/>
        <span className="pipeline-arrow">→</span>
        <PipelineStage icon={<Lightbulb size={17}/>} label="Validated" value="31" note="Insight library" tone="orange"/>
      </div>
    </section>

    <section className="dashboard-bottom-grid section-space">
      <div className="card">
        <div className="card-head"><div><h2>Validated insight pulse</h2><p>Most decision-relevant knowledge</p></div></div>
        <div className="insight-pulse-list">
          {insights.slice(0,3).map(insight=><Link href="/insights" className="insight-pulse" key={insight.id}>
            <div><span className="mono">{insight.id}</span><h3>{insight.title}</h3><p>{insight.summary}</p></div>
            <div className="insight-pulse-meta"><span className={`badge ${insight.strength==="Strong"?"green":"orange"}`}>{insight.strength}</span><b>{insight.evidence}</b><small>evidence</small></div>
          </Link>)}
        </div>
      </div>

      <div className="card quick-actions-card">
        <div className="card-head"><div><h2>Quick actions</h2><p>Continue the research workflow</p></div></div>
        <div className="quick-action-grid">
          <QuickAction href="/sources" icon={<Plus size={17}/>} title="Add data source" note="Facebook Group, CSV or another source"/>
          <QuickAction href="/library" icon={<Database size={17}/>} title="Browse data library" note="Reuse persistent evidence across projects"/>
          <QuickAction href="/review" icon={<ShieldCheck size={17}/>} title="Review evidence" note="23 observations are waiting"/>
          <QuickAction href="/research" icon={<FlaskConical size={17}/>} title="Open research workspace" note="Explore hypotheses and contradictions"/>
        </div>
        <div className="dashboard-workspace-cta">
          <div><b>Ready to investigate?</b><span>Move from executive summary into the full signal workspace.</span></div>
          <Link className="btn primary" href="/overview">Enter workspace <ArrowRight size={15}/></Link>
        </div>
      </div>
    </section>
  </div>
}

function QualityRow({icon,label,value,status}:{icon:React.ReactNode;label:string;value:string;status:"good"|"warn"}){
  return <div className={`quality-row ${status}`}><span>{icon}</span><b>{label}</b><strong>{value}</strong></div>
}
function PipelineStage({icon,label,value,note,tone}:{icon:React.ReactNode;label:string;value:string;note:string;tone:string}){
  return <div className={`dashboard-pipeline-stage ${tone}`}><span className="pipeline-stage-icon">{icon}</span><small>{label}</small><strong>{value}</strong><p>{note}</p></div>
}
function QuickAction({href,icon,title,note}:{href:string;icon:React.ReactNode;title:string;note:string}){
  return <Link href={href} className="quick-action"><span>{icon}</span><div><b>{title}</b><small>{note}</small></div><ArrowRight size={15}/></Link>
}
