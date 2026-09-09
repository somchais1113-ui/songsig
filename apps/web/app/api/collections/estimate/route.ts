import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { estimateFacebookCollectionCost } from "@/lib/facebook";

const schema = z.object({resultsLimit:z.number().int().min(1)});
export async function POST(req:Request){
  const p=schema.safeParse(await req.json().catch(()=>({})));
  if(!p.success) return NextResponse.json({ok:false,error:"Invalid resultsLimit"},{status:400});
  const capped=Math.min(p.data.resultsLimit,env.maxPostsPerRun);
  return NextResponse.json({
    ok:true,
    requested:p.data.resultsLimit,
    capped,
    maxPerRun:env.maxPostsPerRun,
    estimatedUsd:estimateFacebookCollectionCost(capped,env.estimatedUsdPer1000Posts),
    usdPer1000Posts:env.estimatedUsdPer1000Posts,
    disclaimer:"Estimate uses the configured rate and post limit. Actual provider charges can differ by plan, proxies, retries, and Actor changes."
  });
}
