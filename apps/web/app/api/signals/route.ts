import { NextResponse } from "next/server";
import { persistenceConfigured } from "@/lib/env";
import { signals as demoSignals } from "@/lib/data";
import { getAdminSupabase } from "@/lib/server/supabaseAdmin";
import { getDefaultWorkspaceId } from "@/lib/server/workspace";

export async function GET(req:Request){
  const url=new URL(req.url);
  const q=(url.searchParams.get("q")??"").trim();
  const limit=Math.min(Math.max(Number(url.searchParams.get("limit")??100),1),500);
  if(!persistenceConfigured) return NextResponse.json({ok:true,mode:"demo-local",signals:demoSignals});
  const db=getAdminSupabase();const workspaceId=await getDefaultWorkspaceId();
  let query=db.from("observations").select("id,normalized_text,published_at,engagement_score,human_status,source_id,sources(name,platform),observation_tags(dimension,value,confidence)").eq("workspace_id",workspaceId).order("published_at",{ascending:false,nullsFirst:false}).limit(limit);
  if(q) query=query.ilike("normalized_text",`%${q.replace(/[%_]/g,"\\$&")}%`);
  const {data,error}=await query;
  if(error) return NextResponse.json({ok:false,error:error.message},{status:500});
  const rows=(data??[]).map((o:any)=>{
    const tags=o.observation_tags??[];
    const tag=(dimension:string)=>tags.find((t:any)=>t.dimension===dimension)?.value;
    return {
      id:o.id,
      source:o.sources?.name??"Unknown source",
      platform:o.sources?.platform??"unknown",
      date:o.published_at?String(o.published_at).slice(0,10):"",
      text:o.normalized_text,
      topic:tag("topic")??"Pending AI tag",
      intent:tag("intent")??"—",
      sentiment:tag("sentiment")??"—",
      pain:tag("pain_point")??tag("pain_intensity")??"—",
      engagement:Number(o.engagement_score??0),
      tags:tags.filter((t:any)=>["topic","intent","sentiment","pain_intensity"].indexOf(t.dimension)<0).slice(0,5).map((t:any)=>t.value),
      humanStatus:o.human_status
    };
  });
  return NextResponse.json({ok:true,mode:"supabase",signals:rows});
}
