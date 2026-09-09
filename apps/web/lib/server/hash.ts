import "server-only";
import { createHash } from "node:crypto";

export const sha256 = (input: string) => createHash("sha256").update(input).digest("hex");

export function anonymizeAuthor(provider: string, externalId?: string, name?: string) {
  const identity = externalId || name;
  return identity ? `u_${sha256(`${provider}:${identity}`).slice(0, 20)}` : null;
}

export function contentHash(input: {
  sourceId: string;
  provider: string;
  externalId?: string;
  text: string;
  publishedAt?: string;
  itemType: string;
}) {
  const normalized = input.text.replace(/\s+/g, " ").trim().toLowerCase();
  return sha256(`${input.sourceId}|${input.provider}|${input.itemType}|${input.externalId ?? "no-id"}|${input.publishedAt ?? ""}|${normalized}`);
}
