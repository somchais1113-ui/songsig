"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Database, Lightbulb, Radar, RefreshCw, Waypoints } from "lucide-react";

type Summary={
  ok:boolean;
  mode:string;
  persistent:boolean;
  observations:number;
  relevantSignals:number;
  validatedInsights:number;
  highScoreOpportunities:number;
  activeSources:number;
  aiPending:number;
  humanReviewPending:number;
  staleInsights:number;
  lastCollection:string|null;
  acquisition:string;
  analysis:string;
};

const fallback:Summary={
  ok:true,mode:"demo-local",persistent:false,observations:248421,relevantSignals:12482,validatedInsights:31,
  highScoreOpportunities:7,activeSources:5,aiPending:142,humanReviewPending:23,staleInsights:4,lastCollection:null,
  acquisition:"demo",analysis:"demo"
};

function compact(value:number){
  return new Intl.NumberFormat("en",{notation:value>=10000?"compact":"standard",maximumFractionDigits:1}).format(value);
}
function relativeTime(date:string|null){
  if(!date) return "Demo snapshot";
  const diff=Math.max(0,Date.now()-new Date(date).getTime());
  const minutes=Math.floor(diff/60000);
  if(minutes<1) return "Just now";
  if(minutes<60) return `${minutes} min ago`;
  const hours=Math.floor(minutes/60);
  if(hours<24) return `${hours} hr ago`;
  const days=Math.floor(hours/24);
  return `${days} d ago`;
}

export function DashboardLiveSummary(){
  const [data,setData]=useState<Summary>(fallback);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  const load=useCallback(async()=>{
    setLoading(true);setError(null);
    try{
      const response=await fetch("/api/dashboard",{cache:"no-store"});
      const body=await response.json();
      if(!response.ok||!body.ok) throw new Error(body.error||"Dashboard summary unavailable");
      setData(body);
    }catch(err){
      setError(err instanceof Error?err.message:String(err));
    }finally{setLoading(false);}
  },[]);

  useEffect(()=>{void load();},[load]);

  const modeLabel=useMemo(()=>data.persistent?"Live · Supabase":"Demo dataset",[data.persistent]);

  return <>
    <div className="dashboard-live-toolbar">
      <span className={`badge ${data.persistent?"green":"orange"}`}>{modeLabel}</span>
      {error?<span className="dashboard-live-error">Using last visible snapshot · {error}</span>:null}
      <button className="btn" onClick={()=>void load()} disabled={loading}>
        <RefreshCw size={15} className={loading?"spin":""}/>{loading?"Refreshing…":"Refresh snapshot"}
      </button>
    </div>

    <section className="dashboard-status-strip">
      <div><i className="status-dot"/><span>System status</span><b>{data.persistent?"Persistent":"Demo"}</b></div>
      <div><span>Last collection</span><b>{relativeTime(data.lastCollection)}</b></div>
      <div><span>AI queue</span><b>{data.aiPending.toLocaleString()} pending</b></div>
      <div><span>Human review</span><b>{data.humanReviewPending.toLocaleString()} waiting</b></div>
      <div><span>Active sources</span><b>{data.activeSources.toLocaleString()}</b></div>
    </section>

    <section className="dashboard-kpi-grid">
      <ExecutiveKpi icon={<Database size={18}/>} label="Persistent observations" value={compact(data.observations)} delta={data.persistent?"LIVE":"DEMO"} note={`${data.activeSources.toLocaleString()} active data sources`}/>
      <ExecutiveKpi icon={<Radar size={18}/>} label="Relevant signals" value={compact(data.relevantSignals)} delta="FILTERED" note="Relevance score ≥ 0.50"/>
      <ExecutiveKpi icon={<Lightbulb size={18}/>} label="Validated insights" value={compact(data.validatedInsights)} delta={data.staleInsights?`${data.staleInsights} stale`:"CURRENT"} note="Validated knowledge with traceable evidence"/>
      <ExecutiveKpi icon={<Waypoints size={18}/>} label="High-score opportunities" value={compact(data.highScoreOpportunities)} delta="≥ 80" note="Opportunity score threshold"/>
    </section>
  </>
}

function ExecutiveKpi({icon,label,value,delta,note}:{icon:React.ReactNode;label:string;value:string;delta:string;note:string}){
  return <div className="card executive-kpi"><div className="executive-kpi-head"><span>{icon}</span><b>{delta}</b></div><small>{label}</small><strong>{value}</strong><p>{note}</p></div>
}
