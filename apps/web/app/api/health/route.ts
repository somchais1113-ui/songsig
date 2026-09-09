import { NextResponse } from "next/server";
import { acquisitionConfigured, persistenceConfigured } from "@/lib/env";
export async function GET(){return NextResponse.json({ok:true,service:"consumer-signal-engine",version:"0.3.0",persistence:persistenceConfigured?"supabase":"demo-local",acquisition:acquisitionConfigured?"apify":"not-configured"})}
