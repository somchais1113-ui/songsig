import { NextResponse } from "next/server";
import { refreshCollectionJob } from "@/lib/server/collectionJobs";
export async function POST(_req:Request,context:{params:Promise<{jobId:string}>}){
  const {jobId}=await context.params;
  try{return NextResponse.json({ok:true,...await refreshCollectionJob(jobId)});}catch(error){return NextResponse.json({ok:false,error:error instanceof Error?error.message:String(error),jobId},{status:500});}
}
