# GitHub + Vercel setup

## Create repository

```bash
git init
git add .
git commit -m "feat: Consumer Signal Engine v0.2.0"
git branch -M main
git remote add origin git@github.com:YOUR_ACCOUNT/consumer-signal-engine.git
git push -u origin main
```

## Vercel

1. Import the repository in Vercel.
2. Framework: Next.js.
3. Root directory: repository root.
4. Build command: `npm run build`.
5. Add environment variables from `.env.example`.
6. Deploy.

## Supabase

Create a project and run:

`supabase/migrations/001_init.sql`

Add production RLS policies before storing real research data.

## Secrets

Never commit:
- Apify token
- Supabase service role key
- AI API key
- Facebook/browser cookies

## First production integration

Use one known public Facebook Group or a controlled dataset. Run a small collection, save the raw JSON sample, then update the mapper in `packages/connectors/src/apifyFacebookGroups.ts`. Do not guess provider field names.
