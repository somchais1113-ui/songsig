import { NextResponse } from "next/server";
import { z } from "zod";
import { startCollectionJob } from "@/lib/server/collectionJobs";

const schema=z.object({
  sourceId:z.string().uuid(),
  mode:z.enum(["discovery","targeted","incremental"]).default("discovery"),
  resultsLimit:z.number().int().min(1).default(500),
  viewOption:z.enum(["CHRONOLOGICAL","RECENT_ACTIVITY","TOP_POSTS","CHRONOLOGICAL_LISTINGS"]).default("CHRONOLOGICAL"),
  onlyPostsNewerThan:z.string().optional(),
  searchGroupKeyword:z.string().max(200).optional()
});
export async function POST(req:Request){
  const parsed=schema.safeParse(await req.json().catch(()=>({})));
  if(!parsed.success) return NextResponse.json({ok:false,error:"Invalid collection plan",details:parsed.error.flatten()},{status:400});
  try{return NextResponse.json({ok:true,...await startCollectionJob(parsed.data)});}catch(error){return NextResponse.json({ok:false,error:error instanceof Error?error.message:String(error)},{status:502});}
}
