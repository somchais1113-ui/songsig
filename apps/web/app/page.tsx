import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Database,
  Eye,
  Layers3,
  Radar,
  ShieldCheck,
  Sparkles,
  Waypoints
} from "lucide-react";

const sourceChips = ["Facebook Groups", "CSV / Research", "YouTube", "Reddit", "Reviews", "Manual Notes"];

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Link href="/" className="landing-brand" aria-label="Consumer Signal Engine home">
          <span className="landing-brand-mark"><Sparkles size={18}/></span>
          <span>
            <b>Consumer Signal Engine</b>
            <small>Evidence-backed research intelligence</small>
          </span>
        </Link>
        <nav className="landing-nav-links" aria-label="Landing navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#capabilities">Capabilities</a>
          <Link href="/dashboard" className="landing-nav-cta">Open dashboard <ArrowRight size={15}/></Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-glow landing-glow-one"/>
          <div className="landing-glow landing-glow-two"/>
          <div className="landing-hero-copy">
            <div className="landing-kicker"><Radar size={14}/> Consumer intelligence, built around evidence</div>
            <h1>Turn noisy conversations into <span>decisions you can defend.</span></h1>
            <p>
              Collect public conversations, preserve raw evidence, structure consumer signals, validate hypotheses,
              and build a reusable insight library instead of starting analysis from zero every time.
            </p>
            <div className="landing-actions">
              <Link href="/dashboard" className="landing-btn primary">Open executive dashboard <ArrowRight size={17}/></Link>
              <a href="#how-it-works" className="landing-btn secondary">See the workflow</a>
            </div>
            <div className="landing-proof">
              <span><CheckCircle2 size={15}/> Persistent data</span>
              <span><CheckCircle2 size={15}/> Traceable evidence</span>
              <span><CheckCircle2 size={15}/> Human validation</span>
            </div>
          </div>

          <div className="landing-visual" aria-label="Product preview">
            <div className="preview-window">
              <div className="preview-topbar">
                <div className="preview-dots"><i/><i/><i/></div>
                <span>Product Research · Last 30 days</span>
                <b>LIVE</b>
              </div>
              <div className="preview-body">
                <aside className="preview-sidebar">
                  <div className="preview-logo"><Sparkles size={15}/></div>
                  {[1,2,3,4,5,6].map(i=><span key={i} className={i===1?"active":""}/>) }
                </aside>
                <div className="preview-content">
                  <div className="preview-heading">
                    <div><small>EXECUTIVE OVERVIEW</small><strong>Consumer signal health</strong></div>
                    <span className="preview-pill">30 days</span>
                  </div>
                  <div className="preview-kpis">
                    <MiniKpi value="248K" label="Observations" delta="+18.4%"/>
                    <MiniKpi value="31" label="Validated insights" delta="+6"/>
                    <MiniKpi value="7" label="Opportunities" delta="+2"/>
                  </div>
                  <div className="preview-grid">
                    <div className="preview-chart-card">
                      <div className="preview-card-title"><span>Signal velocity</span><b>+38%</b></div>
                      <div className="preview-chart">
                        {[26,31,29,43,48,41,56,61,68,78,88,96].map((h,i)=><i key={i} style={{height:`${h}%`}}/>) }
                      </div>
                      <div className="preview-axis"><span>Aug</span><span>Sep</span></div>
                    </div>
                    <div className="preview-opportunity">
                      <small>TOP OPPORTUNITY</small>
                      <div className="preview-score">91</div>
                      <strong>Waterproof permanence</strong>
                      <p>Evidence is strengthening across multiple communities.</p>
                      <div className="preview-progress"><i/></div>
                    </div>
                  </div>
                  <div className="preview-signal-row">
                    <span><i className="dot blue"/> Plastic adhesion <b>↑ 52%</b></span>
                    <span><i className="dot cyan"/> DIY customization <b>↑ 37%</b></span>
                    <span><i className="dot purple"/> Outdoor marking <b>↑ 29%</b></span>
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-card floating-evidence">
              <ShieldCheck size={18}/>
              <div><small>Evidence confidence</small><b>Strong · 84/100</b></div>
            </div>
            <div className="floating-card floating-source">
              <Database size={18}/>
              <div><small>Data library</small><b>Persistent & reusable</b></div>
            </div>
          </div>
        </section>

        <section className="source-strip" aria-label="Supported source types">
          <span className="source-strip-label">Designed for mixed research sources</span>
          <div>{sourceChips.map(source=><span key={source}>{source}</span>)}</div>
        </section>

        <section className="landing-section" id="how-it-works">
          <div className="landing-section-head">
            <div className="landing-kicker"><Layers3 size={14}/> Research operating system</div>
            <h2>From raw conversation to validated opportunity.</h2>
            <p>The system separates collection, evidence, interpretation, and decision-making so AI never becomes the only source of truth.</p>
          </div>
          <div className="workflow-grid">
            <WorkflowStep index="01" icon={<Database size={20}/>} title="Collect & preserve" text="Bring in public group conversations, imports, reviews and research notes. Raw snapshots remain available for audit and re-analysis."/>
            <WorkflowStep index="02" icon={<BrainCircuit size={20}/>} title="Structure signals" text="Normalize, anonymize, deduplicate, tag and embed observations without prematurely deciding what matters."/>
            <WorkflowStep index="03" icon={<ShieldCheck size={20}/>} title="Validate evidence" text="Human review and challenger logic test the signal strength, contradictions, coverage and evidence quality behind each hypothesis."/>
            <WorkflowStep index="04" icon={<Waypoints size={20}/>} title="Act on opportunity" text="Turn validated insight into prioritized product, marketing, content and design opportunities with traceable evidence."/>
          </div>
        </section>

        <section className="landing-section capability-section" id="capabilities">
          <div className="capability-copy">
            <div className="landing-kicker"><Eye size={14}/> Built for long-term learning</div>
            <h2>Your insight history should compound, not disappear after refresh.</h2>
            <p>
              The data library persists observations, tags, evidence links, validated insights and historical metrics. A new research question can reuse old evidence without recollecting the same source.
            </p>
            <div className="capability-list">
              <span><CheckCircle2 size={16}/> Supabase / PostgreSQL persistent data layer</span>
              <span><CheckCircle2 size={16}/> Raw evidence snapshots and deduplication</span>
              <span><CheckCircle2 size={16}/> pgvector-ready semantic retrieval</span>
              <span><CheckCircle2 size={16}/> Insight history and evidence lineage</span>
            </div>
            <Link href="/dashboard" className="text-link">View the executive dashboard <ArrowRight size={15}/></Link>
          </div>
          <div className="capability-stack">
            <StackLayer label="Decision layer" value="Opportunity · Product · Marketing · Design" tone="blue"/>
            <StackLayer label="Knowledge layer" value="Insight · Evidence · Historical metrics" tone="purple"/>
            <StackLayer label="Intelligence layer" value="Tagging · Embeddings · Researcher · Challenger" tone="cyan"/>
            <StackLayer label="Data layer" value="Observations · Raw snapshots · Sources" tone="green"/>
          </div>
        </section>

        <section className="landing-final-cta">
          <div>
            <div className="landing-kicker light"><Sparkles size={14}/> Consumer Signal Engine</div>
            <h2>See the whole research system before diving into individual signals.</h2>
            <p>Start with the executive dashboard, then move into sources, data library, evidence review, insights and opportunities.</p>
          </div>
          <Link href="/dashboard" className="landing-btn light">Open dashboard <ArrowRight size={17}/></Link>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-brand compact">
          <span className="landing-brand-mark"><Sparkles size={16}/></span>
          <span><b>Consumer Signal Engine</b><small>Research Intelligence · v0.4</small></span>
        </div>
        <span>Persistent evidence · Human-in-the-loop · Provider-agnostic architecture</span>
      </footer>
    </div>
  );
}

function MiniKpi({value,label,delta}:{value:string;label:string;delta:string}){
  return <div className="preview-kpi"><span>{label}</span><strong>{value}</strong><b>{delta}</b></div>
}
function WorkflowStep({index,icon,title,text}:{index:string;icon:React.ReactNode;title:string;text:string}){
  return <article className="workflow-step"><div className="workflow-step-top"><span>{icon}</span><b>{index}</b></div><h3>{title}</h3><p>{text}</p></article>
}
function StackLayer({label,value,tone}:{label:string;value:string;tone:string}){
  return <div className={`stack-layer ${tone}`}><span>{label}</span><b>{value}</b></div>
}
