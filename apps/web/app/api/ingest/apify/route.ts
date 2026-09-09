import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
  const body=await req.json().catch(()=>({}));
  const token=process.env.APIFY_TOKEN;
  const actorId=process.env.APIFY_FACEBOOK_GROUPS_ACTOR_ID || "apify/facebook-groups-scraper";
  if(!token){
    return NextResponse.json({
      ok:false,
      mode:"prototype",
      message:"APIFY_TOKEN is not configured. Endpoint is wired but will not call Apify.",
      actorId,
      received:body
    },{status:200});
  }
  return NextResponse.json({
    ok:true,
    mode:"configured",
    message:"Connector credentials detected. Map the selected Actor input/output in packages/connectors before enabling production ingestion.",
    actorId
  });
}
