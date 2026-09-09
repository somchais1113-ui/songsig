import { NextResponse } from "next/server";
import { z } from "zod";
import { persistenceConfigured } from "@/lib/env";
import { normalizeFacebookGroupUrl } from "@/lib/facebook";
import { getAdminSupabase } from "@/lib/server/supabaseAdmin";
import { getDefaultWorkspaceId } from "@/lib/server/workspace";

const createSchema=z.object({
  name:z.string().min(1).max(160),
  url:z.string().min(1),
  watchEnabled:z.boolean().default(false),
  config:z.record(z.unknown()).optional()
});

export async function GET(){
  if(!persistenceConfigured) return NextResponse.json({ok:true,mode:"demo-local",sources:[]});
  const db=getAdminSupabase();
  const workspaceId=await getDefaultWorkspaceId();
  const {data,error}=await db.from("data_library_source_stats").select("*").eq("workspace_id",workspaceId).order("name");
  if(error) return NextResponse.json({ok:false,error:error.message},{status:500});
  return NextResponse.json({ok:true,mode:"supabase",sources:data??[]});
}

export async function POST(req:Request){
  if(!persistenceConfigured) return NextResponse.json({ok:false,error:"Supabase is not configured. Demo UI stores source settings in this browser only."},{status:503});
  const parsed=createSchema.safeParse(await req.json().catch(()=>({})));
  if(!parsed.success) return NextResponse.json({ok:false,error:"Invalid source configuration",details:parsed.error.flatten()},{status:400});
  const normalized=normalizeFacebookGroupUrl(parsed.data.url);
  if(!normalized.valid) return NextResponse.json({ok:false,error:normalized.reason},{status:400});

  const db=getAdminSupabase();
  const workspaceId=await getDefaultWorkspaceId();
  const payload={
    workspace_id:workspaceId,
    platform:"facebook",
    source_type:"group",
    name:parsed.data.name,
    source_url:parsed.data.url,
    normalized_url:normalized.normalizedUrl,
    provider:"apify",
    accessibility_status:"unverified",
    capabilities:{posts:true,comments:true,reactions:true,dateFilter:true,keywordFilter:true,incremental:true},
    config:parsed.data.config??{},
    watch_enabled:parsed.data.watchEnabled,
    active:true
  };
  const {data,error}=await db.from("sources").upsert(payload,{onConflict:"workspace_id,normalized_url"}).select("*").single();
  if(error) return NextResponse.json({ok:false,error:error.message},{status:500});
  await db.from("watch_rules").upsert({
    workspace_id:workspaceId,
    source_id:data.id,
    enabled:parsed.data.watchEnabled,
    cadence:"weekly",
    mode:"incremental",
    next_run_at:parsed.data.watchEnabled?new Date(Date.now()+7*24*60*60*1000).toISOString():null,
    updated_at:new Date().toISOString()
  },{onConflict:"workspace_id,source_id"});
  return NextResponse.json({ok:true,source:data});
}

const patchSchema=z.object({
  id:z.string().uuid(),
  active:z.boolean().optional(),
  watchEnabled:z.boolean().optional()
});

export async function PATCH(req:Request){
  if(!persistenceConfigured) return NextResponse.json({ok:false,error:"Supabase is not configured."},{status:503});
  const parsed=patchSchema.safeParse(await req.json().catch(()=>({})));
  if(!parsed.success) return NextResponse.json({ok:false,error:"Invalid source update"},{status:400});
  const updates:Record<string,unknown>={updated_at:new Date().toISOString()};
  if(parsed.data.active!==undefined) updates.active=parsed.data.active;
  if(parsed.data.watchEnabled!==undefined) updates.watch_enabled=parsed.data.watchEnabled;
  const db=getAdminSupabase();
  const {data,error}=await db.from("sources").update(updates).eq("id",parsed.data.id).select("*").single();
  if(error) return NextResponse.json({ok:false,error:error.message},{status:500});
  if(parsed.data.watchEnabled!==undefined){
    await db.from("watch_rules").upsert({
      workspace_id:data.workspace_id,source_id:data.id,enabled:parsed.data.watchEnabled,cadence:"weekly",mode:"incremental",
      next_run_at:parsed.data.watchEnabled?new Date(Date.now()+7*24*60*60*1000).toISOString():null
    },{onConflict:"workspace_id,source_id"});
  }
  return NextResponse.json({ok:true,source:data});
}
