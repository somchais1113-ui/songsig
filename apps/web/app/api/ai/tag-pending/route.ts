import { NextResponse } from "next/server";
import { z } from "zod";
import { analysisConfigured, persistenceConfigured } from "@/lib/env";
import { getAdminSupabase } from "@/lib/server/supabaseAdmin";
import { getDefaultWorkspaceId } from "@/lib/server/workspace";
import { openAIEmbeddings, openAIJson } from "@/lib/server/openai";

const requestSchema=z.object({limit:z.number().int().min(1).max(50).default(20)});
type Result={items:Array<{observationId:string;language:string;relevanceScore:number;tags:Array<{dimension:string;value:string;confidence:number}>}>};
const outputSchema={type:"object",additionalProperties:false,properties:{items:{type:"array",items:{type:"object",additionalProperties:false,properties:{observationId:{type:"string"},language:{type:"string"},relevanceScore:{type:"number",minimum:0,maximum:1},tags:{type:"array",items:{type:"object",additionalProperties:false,properties:{dimension:{type:"string"},value:{type:"string"},confidence:{type:"number",minimum:0,maximum:1}},required:["dimension","value","confidence"]}}},required:["observationId","language","relevanceScore","tags"]}}},required:["items"]};

export async function POST(req:Request){
  if(!persistenceConfigured) return NextResponse.json({ok:false,error:"Supabase persistence is not configured."},{status:503});
  if(!analysisConfigured) return NextResponse.json({ok:false,error:"Configure OPENAI_API_KEY and AI_MODEL to run tagging."},{status:503});
  const parsed=requestSchema.safeParse(await req.json().catch(()=>({limit:20})));if(!parsed.success) return NextResponse.json({ok:false,error:"Invalid batch size"},{status:400});
  const db=getAdminSupabase();const workspaceId=await getDefaultWorkspaceId();
  const {data:rows,error}=await db.from("observations").select("id,normalized_text").eq("workspace_id",workspaceId).eq("ai_status","pending").order("created_at",{ascending:true}).limit(parsed.data.limit);
  if(error) return NextResponse.json({ok:false,error:error.message},{status:500});
  if(!rows?.length) return NextResponse.json({ok:true,processed:0,message:"No pending observations."});

  try{
    const result=await openAIJson<Result>({
      schemaName:"consumer_signal_tags",
      schema:outputSchema,
      instructions:[
        "You are the organizational tagging stage of a consumer research system.",
        "Do not invent strategic insights and do not decide business importance.",
        "Classify only what is grounded in each text. Preserve Thai consumer language in tag values when appropriate.",
        "Useful dimensions include topic, intent, sentiment, pain_point, pain_intensity, jtbd, use_case, brand, surface, workaround, desired_outcome.",
        "For pain_intensity use Low, Medium, or High. relevanceScore measures relevance as consumer/product evidence, not popularity."
      ].join(" "),
      userInput:JSON.stringify(rows.map(r=>({observationId:r.id,text:r.normalized_text})))
    });
    const validIds=new Set(rows.map(r=>r.id));
    let tagged=0;
    for(const item of result.items){
      if(!validIds.has(item.observationId)) continue;
      await db.from("observation_tags").delete().eq("observation_id",item.observationId);
      if(item.tags.length){
        const {error:tagError}=await db.from("observation_tags").insert(item.tags.slice(0,24).map(t=>({observation_id:item.observationId,dimension:t.dimension.trim().toLowerCase(),value:t.value.trim(),confidence:t.confidence,model:"openai"})));
        if(tagError) throw tagError;
      }
      await db.from("observations").update({language:item.language,relevance_score:item.relevanceScore,ai_status:"tagged",updated_at:new Date().toISOString()}).eq("id",item.observationId);
      tagged++;
    }

    let embedded=0;let embeddingError:string|null=null;
    try{
      const embeddings=await openAIEmbeddings(rows.map(r=>r.normalized_text));
      for(let i=0;i<rows.length;i++){
        const vector=embeddings.vectors[i];if(!vector) continue;
        const {error:embedError}=await db.from("observation_embeddings").upsert({observation_id:rows[i].id,provider:embeddings.provider,model:embeddings.model,dimensions:embeddings.dimensions,embedding:vector},{onConflict:"observation_id"});
        if(embedError) throw embedError;
        await db.from("observations").update({ai_status:"embedded",updated_at:new Date().toISOString()}).eq("id",rows[i].id);embedded++;
      }
    }catch(err){embeddingError=err instanceof Error?err.message:String(err);}
    return NextResponse.json({ok:true,processed:rows.length,tagged,embedded,embeddingError});
  }catch(err){
    const message=err instanceof Error?err.message:String(err);
    return NextResponse.json({ok:false,error:message},{status:502});
  }
}
