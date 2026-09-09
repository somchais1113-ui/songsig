# Deployment Checklist

## GitHub

```bash
git init
git add .
git commit -m "feat: Consumer Signal Engine v0.4 persistent data architecture"
git branch -M main
git remote add origin git@github.com:YOUR_ACCOUNT/consumer-signal-engine.git
git push -u origin main
```

## Supabase

Run all migrations in filename order.

Required server environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

The service-role key must never be prefixed `NEXT_PUBLIC_`.

## Apify

```text
APIFY_TOKEN
APIFY_FACEBOOK_GROUPS_ACTOR_ID=apify/facebook-groups-scraper
```

Keep the token server-only.

## Vercel

- Framework: Next.js
- Root directory: repository root
- Build command: `npm run build`
- Node: 22
- Add environment variables
- redeploy after changing env values

## Access protection

For an early single-user deployment:

```text
APP_BASIC_AUTH_USER
APP_BASIC_AUTH_PASSWORD
```

For a team deployment, implement Supabase Auth and explicit RLS membership policies before removing the gate.

## Smoke checks

- `/api/system/status` reports `supabase`
- sidebar reports `Supabase persistent`
- Source preflight accepts a valid group URL
- collection estimate applies the hard cap
- first 20-post job reaches terminal state
- Data Library counts remain after refresh
- no secrets appear in browser bundle / GitHub
