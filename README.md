# DayLah

A private-by-default date calculator and countdown workspace, built from [the project brief](daylah-project-plan.md).

## Structure

The architecture follows MuseCards (`D:/Workspace/Go/gravure-model`) and PickLah: `router → handler → service → repository → database`. The API remains at the root, as specified in the brief; `frontend/` contains React/Vite/TypeScript with ordinary CSS.

- `config/`: environment configuration
- `model/`: public countdown snapshot
- `repository/`: PostgreSQL queries for the `daylah` table
- `service/`: calendar snapshot validation, randomness, token hashing
- `handler/`: HTTP contracts and request limits
- `router/`: route composition and security middleware
- `database/`, `migrations/`: explicit versioned schema migration
- `data/`: source-backed holiday coverage; matching frontend datasets under `frontend/public/holidays/`
- `frontend/src/features/calendar/`: Temporal date-only calculations and tests
- `deploy/`, `.github/workflows/`: isolated service/deployment and verification

## Local development

Requires Go 1.22.7+ (Go 1.26 tested), Node 24+, and PostgreSQL.

```powershell
cd frontend
npm ci
npm run dev
```

The calculator and local events work without the API. Vite proxies `/v1` to port 8080. To enable sharing, configure the root `.env` using `.env.example`. Go loads it automatically without overriding existing shell variables. Use either `DATABASE_URL` or the separate `POSTGRES_*` settings. `POSTGRES_AUTO_MIGRATE=true` applies versioned migrations at startup; the explicit migration command works regardless of that setting. Run these commands from the project root:

```powershell
go run . migrate
go run .
```

## Verify and build

```powershell
go test ./...
go vet ./...
cd frontend
npm test
npm run build
```

The build prerenders `/`, `/between-dates/`, `/until/`, `/age/`, and `/anniversary/` with unique metadata and static explanations. `frontend/.env.production` configures the confirmed `https://daylah.my` origin for canonical URLs, structured data and the sitemap. Shared and query URLs are excluded from indexing. See [SEO.md](SEO.md) for deployment checks and Search Console setup.

## Privacy and sharing

Events and private notes are versioned in browser localStorage or Android Capacitor Preferences. Only the reviewed title, date, timezone, recurrence, leap-day policy and theme are sent when creating a public link. Annual shares default to the next occurrence year; revealing the original year is opt-in. Snapshots are immutable. Deletion tokens are 32 cryptographically random bytes, stored locally; the database stores only SHA-256 hashes. Read responses never include token material. Clearing device storage loses revocation access. Offline calculations remain available; sharing and revocation require the API.

## Holiday coverage

Sources are recorded on every preset with verification date and jurisdiction. Singapore includes the published 2026/2027 national schedules and replacement dates. Malaysia includes both complete annual federal and state schedules, with a state/territory filter; special additional holidays and replacement dates are outside this preset coverage. Past presets are disabled in the country timezone. See HOLIDAYS.md for source verification and limitations. Datasets are calendar presets, not business-day exclusions.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md). The backend is deployed on the shared PickLah server as a separate daylah-api service, listening on 127.0.0.1:8092. No website is deployed. Future backend releases can use the manually triggered workflow after configuring its SSH secrets; no public website domain is required.

## Android

Capacitor Android is now included. See [ANDROID.md](ANDROID.md) for native storage, HTTPS backend configuration, and APK build commands.
