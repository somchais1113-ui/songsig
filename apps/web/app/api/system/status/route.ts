import { NextResponse } from "next/server";
import { acquisitionConfigured, analysisConfigured, env, persistenceConfigured } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    persistence: persistenceConfigured ? "supabase" : "demo-local",
    persistent: persistenceConfigured,
    acquisition: acquisitionConfigured ? "apify" : "not-configured",
    analysis: analysisConfigured ? "openai" : "not-configured",
    actorId: env.apifyActorId,
    demoMode: env.demoMode
  });
}
