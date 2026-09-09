export type Observation = {
  id?: string;
  source: string;
  externalId: string;
  sourceUrl?: string;
  text: string;
  authorHash?: string;
  publishedAt?: string;
  engagement?: { reactions?: number; comments?: number; shares?: number };
};

export async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
