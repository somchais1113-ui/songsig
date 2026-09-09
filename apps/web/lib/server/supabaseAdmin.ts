import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, persistenceConfigured } from "../env";

let client: SupabaseClient | null = null;

export function getAdminSupabase(): SupabaseClient {
  if (!persistenceConfigured) {
    throw new Error("Supabase persistence is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return client;
}
