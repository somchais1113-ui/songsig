import { NextResponse } from "next/server";
import { persistenceConfigured } from "@/lib/env";
import { getAdminSupabase } from "@/lib/server/supabaseAdmin";
import { getDefaultWorkspaceId } from "@/lib/server/workspace";

export async function GET(){
  if(!persistenceConfigured) return NextResponse.json({ok:true,jobs:[]});
  const db=getAdminSupabase();const workspaceId=await getDefaultWorkspaceId();
  const {data,error}=await db.from("collection_jobs").select("id,status,source_id,sources(name)").eq("workspace_id",workspaceId).in("status",["starting","running"]).order("created_at",{ascending:false}).limit(20);
  if(error) return NextResponse.json({ok:false,error:error.message},{status:500});
  return NextResponse.json({ok:true,jobs:data??[]});
}
