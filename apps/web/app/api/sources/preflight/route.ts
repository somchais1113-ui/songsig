import { NextResponse } from "next/server";
import { z } from "zod";
import { acquisitionConfigured, env } from "@/lib/env";
import { normalizeFacebookGroupUrl } from "@/lib/facebook";

const bodySchema = z.object({url: z.string().min(1)});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ok:false,error:"Group URL is required."},{status:400});
  const normalized = normalizeFacebookGroupUrl(parsed.data.url);
  if (!normalized.valid) return NextResponse.json({ok:false,error:normalized.reason},{status:400});

  // A syntactically public-looking URL does not prove data access. We intentionally
  // return unverified until an actual collection run succeeds or returns partial data.
  return NextResponse.json({
    ok: true,
    normalizedUrl: normalized.normalizedUrl,
    groupRef: normalized.groupRef,
    accessibilityStatus: "unverified",
    actorConfigured: acquisitionConfigured,
    actorId: env.apifyActorId,
    capabilities: {
      posts: true,
      comments: true,
      reactions: true,
      dateFilter: true,
      keywordFilter: true,
      incremental: true
    },
    note: "Access is verified by a real provider run. Public Facebook Group URLs can still be partial or blocked."
  });
}
