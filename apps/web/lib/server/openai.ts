import "server-only";
import { env } from "../env";

function requireKey(){if(!env.openaiApiKey) throw new Error("OPENAI_API_KEY is not configured.");return env.openaiApiKey;}

export async function openAIJson<T>(input:{instructions:string;userInput:string;schemaName:string;schema:Record<string,unknown>}){
  if(!env.aiModel) throw new Error("AI_MODEL is not configured.");
  const res=await fetch("https://api.openai.com/v1/responses",{
    method:"POST",
    headers:{"authorization":`Bearer ${requireKey()}`,"content-type":"application/json"},
    body:JSON.stringify({
      model:env.aiModel,
      store:false,
      instructions:input.instructions,
      input:input.userInput,
      text:{format:{type:"json_schema",name:input.schemaName,strict:true,schema:input.schema}}
    })
  });
  if(!res.ok) throw new Error(`OpenAI Responses API ${res.status}: ${await res.text()}`);
  const json=await res.json() as any;
  let text=typeof json.output_text==="string"?json.output_text:"";
  if(!text){
    for(const item of json.output??[]){for(const content of item.content??[]){if(content.type==="output_text"&&typeof content.text==="string") text+=content.text;}}
  }
  if(!text) throw new Error("OpenAI response contained no output text.");
  return JSON.parse(text) as T;
}

export async function openAIEmbeddings(texts:string[]){
  const res=await fetch("https://api.openai.com/v1/embeddings",{
    method:"POST",
    headers:{"authorization":`Bearer ${requireKey()}`,"content-type":"application/json"},
    body:JSON.stringify({model:env.embeddingModel,input:texts})
  });
  if(!res.ok) throw new Error(`OpenAI Embeddings API ${res.status}: ${await res.text()}`);
  const json=await res.json() as any;
  const vectors=(json.data??[]).sort((a:any,b:any)=>a.index-b.index).map((x:any)=>x.embedding as number[]);
  if(vectors.length!==texts.length) throw new Error("Embedding count did not match input count.");
  return {provider:"openai",model:env.embeddingModel,dimensions:vectors[0]?.length??0,vectors};
}
