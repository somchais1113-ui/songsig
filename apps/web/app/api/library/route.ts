import { NextResponse } from "next/server";
import { persistenceConfigured } from "@/lib/env";
import { getAdminSupabase } from "@/lib/server/supabaseAdmin";
import { getDefaultWorkspaceId } from "@/lib/server/workspace";

export async function GET(){
  if(!persistenceConfigured){
    return NextResponse.json({
      ok:true,mode:"demo-local",
      totals:{observations:248421,rawRecords:291382,sources:5,rawBytes:1932735283},
      sources:[]
    });
  }
  const db=getAdminSupabase();
  const workspaceId=await getDefaultWorkspaceId();
  const [sourceStats,rawCount,obsCount,assets]=await Promise.all([
    db.from("data_library_source_stats").select("*").eq("workspace_id",workspaceId).order("observation_count",{ascending:false}),
    db.from("raw_items").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId),
    db.from("observations").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId),
    db.from("raw_assets").select("byte_size").eq("workspace_id",workspaceId)
  ]);
  const firstError=sourceStats.error||rawCount.error||obsCount.error||assets.error;
  if(firstError) return NextResponse.json({ok:false,error:firstError.message},{status:500});
  const rawBytes=(assets.data??[]).reduce((sum,row)=>sum+Number(row.byte_size??0),0);
  return NextResponse.json({
    ok:true,mode:"supabase",
    totals:{observations:obsCount.count??0,rawRecords:rawCount.count??0,sources:sourceStats.data?.length??0,rawBytes},
    sources:sourceStats.data??[]
  });
}
