const GROUP_PATH = /^\/groups\/([^/?#]+)\/?/i;

export type FacebookGroupUrlResult =
  | { valid: true; normalizedUrl: string; groupRef: string }
  | { valid: false; reason: string };

export function normalizeFacebookGroupUrl(input: string): FacebookGroupUrlResult {
  const raw = input.trim();
  if (!raw) return { valid: false, reason: "Group URL is required." };
  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return { valid: false, reason: "This is not a valid URL." };
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (!["facebook.com", "m.facebook.com"].includes(host)) {
    return { valid: false, reason: "Only facebook.com group URLs are supported by this connector." };
  }
  const match = url.pathname.match(GROUP_PATH);
  const groupRef = match?.[1];
  if (!groupRef || groupRef.toLowerCase() === "feed") {
    return { valid: false, reason: "URL must point to a Facebook Group, e.g. facebook.com/groups/<group>." };
  }
  return { valid: true, normalizedUrl: `https://facebook.com/groups/${groupRef}`, groupRef };
}

export function estimateFacebookCollectionCost(resultsLimit: number, usdPer1000Posts: number) {
  const posts = Math.max(1, Math.floor(resultsLimit));
  return Math.round((posts / 1000) * usdPer1000Posts * 10000) / 10000;
}
