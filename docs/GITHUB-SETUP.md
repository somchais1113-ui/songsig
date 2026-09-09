# GitHub Setup

```bash
unzip consumer-signal-engine.zip
cd consumer-signal-engine
git init
git add .
git commit -m "Initial Consumer Signal Engine MVP"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

Recommended GitHub secrets / Vercel env vars:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- APIFY_TOKEN
- APIFY_FACEBOOK_GROUP_ACTOR
- OPENAI_API_KEY

Never commit `.env.local`.
