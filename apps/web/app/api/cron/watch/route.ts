import { NextResponse } from "next/server";
import { acquisitionConfigured, env, persistenceConfigured } from "@/lib/env";
import { getAdminSupabase } from "@/lib/server/supabaseAdmin";
import { refreshCollectionJob, startCollectionJob } from "@/lib/server/collectionJobs";

function nextRun(cadence:string,from=new Date()){
  const ms=cadence==="hourly"?60*60*1000:cadence==="daily"?24*60*60*1000:7*24*60*60*1000;
  return new Date(from.getTime()+ms).toISOString();
}

export async function GET(req:Request){
  const secret=process.env.CRON_SECRET;
  if(!secret) return NextResponse.json({ok:false,error:"CRON_SECRET is not configured."},{status:503});
  if(req.headers.get("authorization")!==`Bearer ${secret}`) return NextResponse.json({ok:false,error:"Unauthorized"},{status:401});
  if(!persistenceConfigured||!acquisitionConfigured) return NextResponse.json({ok:false,error:"Supabase or Apify is not configured."},{status:503});

  const db=getAdminSupabase();
  const finalized:Array<Record<string,unknown>>=[];
  const started:Array<Record<string,unknown>>=[];
  const skipped:Array<Record<string,unknown>>=[];

  // First: finalize provider runs that completed since the previous cron/browser visit.
  const {data:pending}=await db.from("collection_jobs").select("id").in("status",["starting","running"]).order("created_at",{ascending:true}).limit(20);
  for(const job of pending??[]){
    try{finalized.push(await refreshCollectionJob(job.id) as Record<string,unknown>);}catch(error){finalized.push({jobId:job.id,error:error instanceof Error?error.message:String(error)});}
  }

  // Then: start due incremental Watch jobs. Rules are due independently of UI sessions.
  const now=new Date().toISOString();
  const {data:rules,error:rulesError}=await db.from("watch_rules").select("*, sources(*)").eq("enabled",true).lte("next_run_at",now).order("next_run_at",{ascending:true}).limit(env.watchMaxSourcesPerCron);
  if(rulesError) return NextResponse.json({ok:false,error:rulesError.message,finalized},{status:500});

  for(const rule of rules??[]){
    const source=(rule as any).sources;
    if(!source?.active){skipped.push({ruleId:rule.id,reason:"source inactive"});await db.from("watch_rules").update({next_run_at:nextRun(rule.cadence),updated_at:now}).eq("id",rule.id);continue;}
    const {count}=await db.from("collection_jobs").select("id",{count:"exact",head:true}).eq("source_id",rule.source_id).in("status",["starting","running"]);
    if((count??0)>0){skipped.push({ruleId:rule.id,reason:"active job already exists"});continue;}
    try{
      const result=await startCollectionJob({sourceId:rule.source_id,mode:"incremental",resultsLimit:env.defaultResultsLimit,viewOption:"CHRONOLOGICAL"});
      started.push({ruleId:rule.id,...result});
      await db.from("watch_rules").update({last_run_at:now,next_run_at:nextRun(rule.cadence),updated_at:now}).eq("id",rule.id);
    }catch(error){
      skipped.push({ruleId:rule.id,reason:error instanceof Error?error.message:String(error)});
      // Retry next hour instead of waiting a full cadence after a failed start.
      await db.from("watch_rules").update({next_run_at:new Date(Date.now()+60*60*1000).toISOString(),updated_at:now}).eq("id",rule.id);
    }
  }

  return NextResponse.json({ok:true,finalized,started,skipped,checkedAt:now});
}
