import { NextResponse } from "next/server";
import { z } from "zod";
import { persistenceConfigured } from "@/lib/env";
import { getAdminSupabase } from "@/lib/server/supabaseAdmin";
const schema=z.object({status:z.enum(["validated","watch","rejected"]),note:z.string().max(2000).optional()});
export async function PATCH(req:Request,context:{params:Promise<{id:string}>}){
  if(!persistenceConfigured) return NextResponse.json({ok:true,mode:"demo-local"});
  const parsed=schema.safeParse(await req.json().catch(()=>({})));if(!parsed.success) return NextResponse.json({ok:false,error:"Invalid review status"},{status:400});
  const {id}=await context.params;const db=getAdminSupabase();
  const {data,error}=await db.from("observations").update({human_status:parsed.data.status,human_note:parsed.data.note??null,updated_at:new Date().toISOString()}).eq("id",id).select("id,human_status").single();
  if(error) return NextResponse.json({ok:false,error:error.message},{status:500});
  return NextResponse.json({ok:true,item:data});
}
