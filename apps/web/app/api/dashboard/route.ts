import { NextResponse } from "next/server";
import { acquisitionConfigured, analysisConfigured, persistenceConfigured } from "@/lib/env";
import { getAdminSupabase } from "@/lib/server/supabaseAdmin";
import { getDefaultWorkspaceId } from "@/lib/server/workspace";

const demo = {
  mode: "demo-local",
  persistent: false,
  observations: 248421,
  relevantSignals: 12482,
  validatedInsights: 31,
  highScoreOpportunities: 7,
  activeSources: 5,
  aiPending: 142,
  humanReviewPending: 23,
  staleInsights: 4,
  lastCollection: null as string | null,
  acquisition: "demo",
  analysis: "demo"
};

export async function GET(){
  if(!persistenceConfigured) return NextResponse.json({ok:true,...demo});

  try{
    const db=getAdminSupabase();
    const workspaceId=await getDefaultWorkspaceId();
    const [
      observations,
      relevant,
      validated,
      opportunities,
      sources,
      aiPending,
      humanPending,
      stale,
      latestRun
    ]=await Promise.all([
      db.from("observations").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId),
      db.from("observations").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId).gte("relevance_score",0.5),
      db.from("insights").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId).eq("status","validated"),
      db.from("opportunities").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId).gte("opportunity_score",80),
      db.from("sources").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId).eq("active",true),
      db.from("observations").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId).eq("ai_status","pending"),
      db.from("observations").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId).eq("human_status","unreviewed"),
      db.from("insights").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId).eq("evidence_stale",true),
      db.from("collection_jobs").select("completed_at,status").eq("workspace_id",workspaceId).in("status",["succeeded","partial"]).order("completed_at",{ascending:false,nullsFirst:false}).limit(1).maybeSingle()
    ]);

    const error=[observations,relevant,validated,opportunities,sources,aiPending,humanPending,stale,latestRun].find(r=>r.error)?.error;
    if(error) return NextResponse.json({ok:false,error:error.message},{status:500});

    return NextResponse.json({
      ok:true,
      mode:"supabase",
      persistent:true,
      observations:observations.count??0,
      relevantSignals:relevant.count??0,
      validatedInsights:validated.count??0,
      highScoreOpportunities:opportunities.count??0,
      activeSources:sources.count??0,
      aiPending:aiPending.count??0,
      humanReviewPending:humanPending.count??0,
      staleInsights:stale.count??0,
      lastCollection:latestRun.data?.completed_at??null,
      acquisition:acquisitionConfigured?"apify":"not-configured",
      analysis:analysisConfigured?"openai":"not-configured"
    });
  }catch(error){
    return NextResponse.json({ok:false,error:error instanceof Error?error.message:String(error)},{status:500});
  }
}
