# GitHub + Vercel Setup

See `DEPLOYMENT-CHECKLIST.md` for the complete v0.3 procedure.

## GitHub

```bash
git init
git add .
git commit -m "feat: Consumer Signal Engine v0.3 persistent architecture"
git branch -M main
git remote add origin git@github.com:YOUR_ACCOUNT/consumer-signal-engine.git
git push -u origin main
```

## Vercel

1. Import the repository.
2. Framework: Next.js.
3. Root: repository root.
4. Build: `npm run build`.
5. Node 22.
6. Add `.env.example` values as Vercel environment variables.
7. Configure Basic Auth variables for the early single-user deployment.

## Supabase

Run all three migration files in order, not only `001_init.sql`.

Do not expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.
