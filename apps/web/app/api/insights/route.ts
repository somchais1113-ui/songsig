import { NextResponse } from "next/server";
import { z } from "zod";
import { persistenceConfigured } from "@/lib/env";
import { insights as demoInsights } from "@/lib/data";
import { getAdminSupabase } from "@/lib/server/supabaseAdmin";
import { getDefaultWorkspaceId } from "@/lib/server/workspace";

export async function GET(){
  if(!persistenceConfigured) return NextResponse.json({ok:true,mode:"demo-local",insights:demoInsights});
  const db=getAdminSupabase();const workspaceId=await getDefaultWorkspaceId();
  const {data,error}=await db.from("insights").select("id,title,hypothesis,summary,status,evidence_strength,confidence,evidence_stale,created_at,insight_evidence(observation_id,role,observations(source_id)),challenges(id,resolved)").eq("workspace_id",workspaceId).order("updated_at",{ascending:false}).limit(100);
  if(error) return NextResponse.json({ok:false,error:error.message},{status:500});
  const rows=(data??[]).map((i:any)=>{
    const ev=i.insight_evidence??[];const communities=new Set(ev.map((e:any)=>e.observations?.source_id).filter(Boolean));
    return {id:i.id,title:i.title,summary:i.summary??i.hypothesis,status:i.status,strength:Number(i.evidence_strength??i.confidence??0)>=.8?"Strong":Number(i.evidence_strength??i.confidence??0)>=.5?"Medium":"Developing",evidence:ev.filter((e:any)=>e.role==="supporting").length,communities:communities.size,contradictions:ev.filter((e:any)=>e.role==="contradicting").length+(i.challenges??[]).filter((c:any)=>!c.resolved).length,evidenceStale:Boolean(i.evidence_stale),createdAt:i.created_at};
  });
  return NextResponse.json({ok:true,mode:"supabase",insights:rows});
}

const createSchema=z.object({title:z.string().min(3).max(240),hypothesis:z.string().min(3).max(4000),summary:z.string().max(4000).optional(),status:z.enum(["draft","watch","validated"]).default("draft")});
export async function POST(req:Request){
  if(!persistenceConfigured) return NextResponse.json({ok:false,error:"Configure Supabase to create durable insights."},{status:503});
  const parsed=createSchema.safeParse(await req.json().catch(()=>({})));if(!parsed.success) return NextResponse.json({ok:false,error:"Invalid insight",details:parsed.error.flatten()},{status:400});
  const db=getAdminSupabase();const workspaceId=await getDefaultWorkspaceId();
  const {data,error}=await db.from("insights").insert({workspace_id:workspaceId,title:parsed.data.title,hypothesis:parsed.data.hypothesis,summary:parsed.data.summary??null,status:parsed.data.status,created_by:"human"}).select("*").single();
  if(error) return NextResponse.json({ok:false,error:error.message},{status:500});
  return NextResponse.json({ok:true,insight:data});
}
