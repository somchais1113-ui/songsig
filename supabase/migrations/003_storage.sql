-- Supabase Storage bucket for immutable raw snapshots.
insert into storage.buckets (id, name, public, file_size_limit)
values ('raw-data', 'raw-data', false, 52428800)
on conflict (id) do nothing;

-- Keep the bucket private. Server-side ingestion uses the service role.
