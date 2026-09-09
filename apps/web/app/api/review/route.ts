import { NextResponse } from "next/server";
import { persistenceConfigured } from "@/lib/env";
import { reviewSignals } from "@/lib/data";
import { getAdminSupabase } from "@/lib/server/supabaseAdmin";
import { getDefaultWorkspaceId } from "@/lib/server/workspace";

export async function GET(req:Request){
  const limit=Math.min(Math.max(Number(new URL(req.url).searchParams.get("limit")??25),1),100);
  if(!persistenceConfigured) return NextResponse.json({ok:true,mode:"demo-local",items:reviewSignals});
  const db=getAdminSupabase();const workspaceId=await getDefaultWorkspaceId();
  const {data,error}=await db.from("observations").select("id,normalized_text,published_at,human_status,sources(name,platform),observation_tags(dimension,value,confidence)").eq("workspace_id",workspaceId).eq("human_status","unreviewed").order("published_at",{ascending:false,nullsFirst:false}).limit(limit);
  if(error) return NextResponse.json({ok:false,error:error.message},{status:500});
  const items=(data??[]).map((o:any)=>{
    const tags=o.observation_tags??[];const find=(d:string)=>tags.find((t:any)=>t.dimension===d);
    const confidence=Math.round(Math.max(0,...tags.map((t:any)=>Number(t.confidence??0)))*100);
    return {id:o.id,source:`${o.sources?.platform??"source"} · ${o.sources?.name??"Unknown"}`,date:o.published_at?String(o.published_at).slice(0,10):"",text:o.normalized_text,
      tags:tags.filter((t:any)=>!["topic","intent","sentiment","pain_intensity"].includes(t.dimension)).slice(0,6).map((t:any)=>t.value),
      topic:find("topic")?.value??"Pending AI tag",intent:find("intent")?.value??"—",sentiment:find("sentiment")?.value??"—",pain:find("pain_intensity")?.value??"—",confidence,status:o.human_status};
  });
  return NextResponse.json({ok:true,mode:"supabase",items});
}
