export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  apifyToken: process.env.APIFY_TOKEN ?? "",
  apifyActorId: process.env.APIFY_FACEBOOK_GROUPS_ACTOR_ID ?? "apify/facebook-groups-scraper",
  estimatedUsdPer1000Posts: Number(process.env.APIFY_FACEBOOK_ESTIMATED_USD_PER_1000_POSTS ?? "2.60"),
  defaultResultsLimit: Number(process.env.APIFY_DEFAULT_RESULTS_LIMIT ?? "500"),
  maxPostsPerRun: Number(process.env.COLLECTION_MAX_POSTS_PER_RUN ?? "2000"),
  watchMaxSourcesPerCron: Number(process.env.WATCH_MAX_SOURCES_PER_CRON ?? "5"),
  defaultView: process.env.COLLECTION_DEFAULT_VIEW ?? "CHRONOLOGICAL",
  demoMode: (process.env.NEXT_PUBLIC_DEMO_MODE ?? "true").toLowerCase() === "true",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  aiModel: process.env.AI_MODEL ?? "",
  embeddingModel: process.env.EMBEDDING_MODEL ?? "text-embedding-3-small"
};

export const persistenceConfigured = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
export const acquisitionConfigured = Boolean(env.apifyToken && env.apifyActorId);
export const analysisConfigured = Boolean(env.openaiApiKey && env.aiModel);
