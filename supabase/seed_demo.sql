-- Optional demo seed for a fresh local/Supabase environment.
-- Replace the fixed UUIDs only if you intentionally merge with existing data.
insert into public.workspaces(id,name,slug)
values ('00000000-0000-0000-0000-000000000001','Product Research','product-research')
on conflict (id) do nothing;

insert into public.research_projects(id,workspace_id,name,question)
values ('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000001','Paint Marker Opportunity','Which unmet needs are strong enough to justify a paint-marker product direction?')
on conflict (id) do nothing;

insert into public.sources(id,workspace_id,platform,source_type,name,source_url,normalized_url,provider,accessibility_status,capabilities,active,watch_enabled,last_successful_sync_at)
values
('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000001','facebook','group','DIY Thailand','https://www.facebook.com/groups/example-diy','https://facebook.com/groups/example-diy','apify','accessible','{"posts":true,"comments":true,"reactions":true,"incremental":true}',true,true,now()-interval '21 minutes'),
('00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000001','facebook','group','Model Maker Thailand','https://www.facebook.com/groups/example-model','https://facebook.com/groups/example-model','apify','accessible','{"posts":true,"comments":true,"reactions":true,"incremental":true}',true,true,now()-interval '54 minutes'),
('00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000001','manual','import','Field Research Import',null,null,'manual','accessible','{"csv":true}',true,false,now()-interval '1 day')
on conflict (id) do nothing;

insert into public.project_sources(project_id,source_id)
values
('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000201'),
('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000202'),
('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000203')
on conflict do nothing;
