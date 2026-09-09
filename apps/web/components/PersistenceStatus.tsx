"use client";
import { useEffect, useState } from "react";
import { Cloud, HardDrive } from "lucide-react";

type Status={persistent:boolean;persistence:string;acquisition:string;actorId:string};
export function PersistenceStatus(){
  const [status,setStatus]=useState<Status|null>(null);
  useEffect(()=>{fetch("/api/system/status").then(r=>r.json()).then(setStatus).catch(()=>setStatus(null));},[]);
  if(!status) return <div className="status"><i className="status-dot"/><span>Checking data layer…</span></div>;
  return <div className="status" title={status.persistent?"Data persists in Supabase/PostgreSQL":"Demo data persists only in this browser. Configure Supabase for server persistence."}>
    {status.persistent?<Cloud size={14}/>:<HardDrive size={14}/>}<span>{status.persistent?"Supabase persistent":"Demo · browser persistent"}</span>
  </div>
}
