import "server-only";

export function normalizeObservationText(raw:string){
  return raw
    .replace(/https?:\/\/\S+/gi,"[url]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,"[email]")
    .replace(/(?<!\d)(?:\+?66|0)\s*\d(?:[\s-]*\d){7,9}(?!\d)/g,"[phone]")
    .replace(/\s+/g," ")
    .trim();
}
