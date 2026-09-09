import "server-only";
import { ApifyFacebookGroupsConnector, buildFacebookGroupActorInput } from "@cse/connectors";
import { env, persistenceConfigured, acquisitionConfigured } from "../env";
import { estimateFacebookCollectionCost } from "../facebook";
import { getAdminSupabase } from "./supabaseAdmin";
import { persistCollection } from "./persistCollection";

export type StartCollectionInput={
  sourceId:string;
  mode:"discovery"|"targeted"|"incremental";
  resultsLimit:number;
  viewOption:"CHRONOLOGICAL"|"RECENT_ACTIVITY"|"TOP_POSTS"|"CHRONOLOGICAL_LISTINGS";
  onlyPostsNewerThan?:string;
  searchGroupKeyword?:string;
};

export async function startCollectionJob(input:StartCollectionInput){
  if(!persistenceConfigured) throw new Error("Configure Supabase before starting a persistent collection job.");
  if(!acquisitionConfigured) throw new Error("Configure APIFY_TOKEN before starting Facebook collection.");
  const db=getAdminSupabase();
  const {data:source,error:sourceError}=await db.from("sources").select("*").eq("id",input.sourceId).single();
  if(sourceError||!source) throw new Error("Source not found");
  if(source.platform!=="facebook"||!source.normalized_url) throw new Error("This collector currently expects a Facebook Group source.");

  const resultsLimit=Math.min(Math.max(1,input.resultsLimit),env.maxPostsPerRun);
  const incrementalDate=input.mode==="incremental"&&source.last_seen_published_at?String(source.last_seen_published_at).slice(0,10):undefined;
  const onlyPostsNewerThan=input.onlyPostsNewerThan||incrementalDate;
  const actorInput=buildFacebookGroupActorInput({
    groupUrl:source.normalized_url,
    resultsLimit,
    viewOption:input.viewOption,
    onlyPostsNewerThan,
    searchGroupKeyword:input.mode==="targeted"?input.searchGroupKeyword:undefined
  });
  const {data:job,error:jobError}=await db.from("collection_jobs").insert({
    workspace_id:source.workspace_id,
    source_id:source.id,
    mode:input.mode,
    status:"starting",
    requested_scope:{...input,resultsLimit,onlyPostsNewerThan,actorInput},
    estimated_cost_usd:estimateFacebookCollectionCost(resultsLimit,env.estimatedUsdPer1000Posts),
    provider:"apify"
  }).select("*").single();
  if(jobError) throw jobError;

  try{
    const connector=new ApifyFacebookGroupsConnector({token:env.apifyToken,actorId:env.apifyActorId});
    const run=await connector.start(actorInput);
    await db.from("collection_jobs").update({
      status:"running",provider_run_id:run.runId,provider_dataset_id:run.datasetId??null,
      started_at:run.startedAt??new Date().toISOString()
    }).eq("id",job.id);
    return {jobId:job.id as string,providerRun:run,estimateUsd:Number(job.estimated_cost_usd??0)};
  }catch(error){
    const message=error instanceof Error?error.message:String(error);
    await db.from("collection_jobs").update({status:"failed",error_code:"PROVIDER_START_FAILED",error_message:message,completed_at:new Date().toISOString()}).eq("id",job.id);
    throw new Error(message);
  }
}

const terminalProviderStatuses=new Set(["SUCCEEDED","FAILED","TIMED-OUT","ABORTED"]);

export async function refreshCollectionJob(jobId:string){
  if(!persistenceConfigured||!acquisitionConfigured) throw new Error("Persistence or acquisition is not configured.");
  const db=getAdminSupabase();
  const {data:job,error}=await db.from("collection_jobs").select("*").eq("id",jobId).single();
  if(error||!job) throw new Error("Collection job not found");

  if(["succeeded","partial","failed","cancelled"].includes(job.status)) return {job,terminal:true,alreadyFinalized:true,status:job.status};
  if(!job.provider_run_id) throw new Error("Job has no provider run ID.");

  const connector=new ApifyFacebookGroupsConnector({token:env.apifyToken,actorId:env.apifyActorId});
  try{
    const run=await connector.getRun(job.provider_run_id);
    if(!terminalProviderStatuses.has(run.status)){
      await db.from("collection_jobs").update({status:"running",provider_dataset_id:run.datasetId??job.provider_dataset_id}).eq("id",job.id);
      return {jobId:job.id,status:"running",providerStatus:run.status,terminal:false};
    }
    if(run.status!=="SUCCEEDED"){
      await db.from("collection_jobs").update({
        status:"failed",error_code:`APIFY_${run.status}`,error_message:`Provider run ended with ${run.status}`,
        provider_dataset_id:run.datasetId??job.provider_dataset_id,completed_at:run.finishedAt??new Date().toISOString()
      }).eq("id",job.id);
      await db.from("sources").update({accessibility_status:"failed"}).eq("id",job.source_id);
      return {jobId:job.id,status:"failed",providerStatus:run.status,terminal:true};
    }

    const datasetId=run.datasetId??job.provider_dataset_id;
    if(!datasetId) throw new Error("Apify run succeeded without a dataset ID.");
    const requestedScope=(job.requested_scope??{}) as Record<string,unknown>;
    const postsRequested=Number(requestedScope.resultsLimit??0)||undefined;
    const items=await connector.getItems(datasetId,{limit:postsRequested});
    const persisted=await persistCollection({
      workspaceId:job.workspace_id,sourceId:job.source_id,jobId:job.id,provider:"apify",
      providerRunId:run.runId,providerDatasetId:datasetId,postsRequested,items
    });
    const finalStatus=persisted.postsCollected>0?"succeeded":"partial";
    await db.from("collection_jobs").update({status:finalStatus,provider_dataset_id:datasetId,completed_at:run.finishedAt??new Date().toISOString()}).eq("id",job.id);
    await db.from("sources").update({accessibility_status:persisted.postsCollected>0?"accessible":"partial"}).eq("id",job.source_id);
    return {jobId:job.id,status:finalStatus,providerStatus:run.status,terminal:true,persisted};
  }catch(error){
    const message=error instanceof Error?error.message:String(error);
    await db.from("collection_jobs").update({status:"failed",error_code:"FINALIZE_FAILED",error_message:message,completed_at:new Date().toISOString()}).eq("id",job.id);
    throw new Error(message);
  }
}
