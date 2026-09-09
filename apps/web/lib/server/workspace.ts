import "server-only";
import { getAdminSupabase } from "./supabaseAdmin";

export async function getDefaultWorkspaceId() {
  const db = getAdminSupabase();
  const { data, error } = await db.from("workspaces").select("id").order("created_at", {ascending: true}).limit(1).maybeSingle();
  if (error) throw error;
  if (data?.id) return data.id as string;

  const { data: created, error: createError } = await db
    .from("workspaces")
    .insert({name: "Product Research", slug: `product-research-${Date.now()}`})
    .select("id")
    .single();
  if (createError) throw createError;
  return created.id as string;
}
