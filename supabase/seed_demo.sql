insert into research_projects (id,name,question,status) values
('00000000-0000-0000-0000-000000000001','Paint Marker Opportunity','Where are high-value unmet needs emerging around permanent and paint markers?','active')
on conflict do nothing;

insert into sources (project_id,type,name,provider,url,active) values
('00000000-0000-0000-0000-000000000001','facebook_group','DIY Thailand','apify','https://facebook.com/groups/example-diy',true),
('00000000-0000-0000-0000-000000000001','manual','Field Research Import','manual',null,true),
('00000000-0000-0000-0000-000000000001','facebook_group','Motorcycle Custom Community','apify','https://facebook.com/groups/example-moto',true);
