# Package Manifest — Consumer Signal Engine v0.4.0

## Added in this package

- Full responsive Landing Page at `/`.
- Executive Dashboard at `/dashboard`.
- Live dashboard summary endpoint at `/api/dashboard`.
- Live/demo status differentiation on the dashboard.
- Dashboard navigation entry and clearer `Signal Overview` naming.
- Landing-only shell behavior: no workspace sidebar on `/`.
- Desktop, tablet, and mobile responsive rules for both new entry surfaces.
- Updated README, changelog, architecture/product docs, API health version, and package versions.

## Validation performed

- Source-integrity checks for required routes/components.
- TypeScript parser/name pass on all newly changed TS/TSX files. No non-module diagnostics were reported.
- Package version consistency checks.
- Final ZIP integrity test is performed after packaging.

## Environment note

A complete `npm install` could not be completed in the build container because external dependency download timed out. The package therefore does not claim a dependency-installed production build in this environment. Run `npm install && npm run check` in the target GitHub/Vercel environment.
