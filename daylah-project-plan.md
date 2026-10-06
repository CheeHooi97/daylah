# DayLah — Project Plan

Status: implementation-ready planning brief. Prepared 4 October 2026. The website and logo assets are future implementation deliverables.

## Product brief

DayLah is a free date calculator and personal countdown tool for a global English-speaking audience, with verified Malaysia/Singapore holiday presets. Success means visitors can answer “How many days?” immediately and save meaningful dates without registering.

Working name: **DayLah**. Domain and trademark availability have not been verified.

Launch without accounts, ads, payments, cloud sync, reminders, calendar integrations, business-day calculations, global holiday coverage, or native apps. Personal events are saved locally and become public only through an explicit sharing flow.

## Technology and repository structure

Use the verified MuseCards/PickLah foundation: React + Vite, TypeScript as in PickLah, Go with Echo, GORM, and PostgreSQL. Use ordinary CSS with reusable tokens/components.

Create a separate DayLah repository. Keep the Go API at the root and frontend in `frontend/`. Follow PickLah's handlers/services/repositories conventions. Pin dependency versions and commit lockfiles during setup. PostgreSQL stores shared countdown snapshots; local saved events do not require the API.

## Launch features

- Days between two dates, with an inclusive-count option.
- Days until or since a date.
- Calendar age, total elapsed days, and next-birthday countdown.
- Anniversary calculation and annual recurrence.
- Locally saved birthdays, anniversaries, and events, with edit/delete controls.
- Verified Malaysia/Singapore holiday presets for available current/next-year coverage.
- Copyable results and public share links with creator-controlled revocation.

## User flows and states

1. **Calculate:** select mode, enter dates, and read the result immediately. No login, modal, or save prompt blocks the answer.
2. **Save:** name an event, choose its date/timezone and recurrence, then save on this device. Label storage as device-local.
3. **Browse:** show saved events in chronological order by next occurrence, with clear Today and overdue states.
4. **Share:** preview exactly the public title/date/timezone/recurrence/theme, explicitly create the public snapshot, then copy its link. Save the revocation token locally and explain that losing it loses anonymous revocation access.
5. **Revoke:** choose a locally owned shared snapshot and delete it; the public link then becomes unavailable. Editing a local event does not mutate an existing snapshot.

Support empty/invalid dates, future birth dates, unsupported timezones, storage failure, offline sharing attempts, unavailable holidays, API failure, clipboard failure, and unavailable/revoked links. Calculator functions must remain usable when saving or the API fails.

## Calendar calculation rules

- Treat inputs as Gregorian dates in `YYYY-MM-DD` form, not timestamps. Validate dates strictly; do not normalize impossible dates silently.
- Compute elapsed days with date-only calendar arithmetic, avoiding local timestamp subtraction and daylight-saving errors. Use a tested date-only library, such as Temporal via its polyfill, for calendar periods.
- Days between defaults to elapsed days excluding the start date. Inclusive count adds one to the absolute interval and retains direction for reversed dates; identical dates return zero elapsed or one inclusive day.
- Reversed dates show signed elapsed days and an explanatory direction label.
- Until/since shows Today for the same date, “X days until” for future dates, and “X days ago” for past dates.
- Age/anniversary results show calendar years, months, and days plus total elapsed days. Reject future birth/original-anniversary dates. Use constrained calendar addition for month-end dates and verify fixtures explicitly.
- Annual February 29 events use February 28 in non-leap years by default; offer March 1 and persist the choice. Preserve the original date rather than permanently replacing it with a non-leap occurrence.
- Today defaults to the browser's IANA timezone. Persist the selected zone with saved/shared countdowns and display it alongside the result. If detection fails, use UTC and show that fallback.
- Refresh at midnight in the selected timezone and when the tab becomes active. Calculate the next local midnight using timezone-aware rules; do not assume every day lasts 24 hours.
- Use days rather than second-by-second countdown animation.

## Holidays and source maintenance

Maintain a versioned repository dataset containing country, optional subdivision, name, holiday date, observed date where applicable, source URL, and verification date. Verify dates against official government sources during implementation.

At launch, target 2026 and 2027 records wherever officially available. Display coverage year and jurisdiction. Distinguish an empty verified dataset from unavailable/unverified coverage. Do not predict movable holidays or imply complete Malaysian state coverage. National and state-specific records must be clearly labelled.

Holiday dates and observed dates are distinct; expose both when different. Presets create date calculations/events and do not imply business-day exclusion. Review source-backed updates before release and when new official schedules are published.

## Public interfaces and persistence

| Interface | Purpose |
|---|---|
| `GET /v1/holidays?country=MY\|SG&year=YYYY` | Holiday records, version, and explicit coverage metadata |
| `POST /v1/countdowns` | Create an immutable public snapshot |
| `GET /v1/countdowns/:publicId` | Read an active snapshot |
| `DELETE /v1/countdowns/:publicId` | Revoke using the creator's deletion token |
| `GET /healthz` | Process/database readiness |

Public snapshot fields: title, date, IANA timezone, recurrence (`none` or `annual`), February 29 policy, and allowlisted theme. The create response returns the public ID and deletion token; read responses never include the token or hash. Send deletion authorization in a bearer header, never in a public URL.

Generate unpredictable public IDs and high-entropy deletion tokens with Go's cryptographic randomness. Store only the deletion-token hash. Validate dates, timezone names, title length (1–120 characters), recurrence settings, and theme identifiers. Render titles as text, never raw HTML.

Use a PostgreSQL snapshot table with internal ID, unique public ID, public fields, token hash, creation timestamp, and revocation timestamp. Use explicit versioned migrations in production. Revoked or nonexistent snapshots return an unavailable response without exposing ownership information. Snapshots do not expire automatically in the MVP.

Rate-limit creation to 10 requests per minute per client IP, with documented proxy trust and a request-body limit. Keep the initial deployment single-instance; distributed rate limiting is a later scaling change. Redact authorization tokens and user-entered content from logs.

Local records include schema version, local ID, title, original date, timezone, recurrence, February 29 policy, theme, and optional private notes. Notes are never shared. The public preview uses only the next occurrence for birthdays/anniversaries by default; including the original year requires explicit opt-in. A snapshot stores the resulting reviewed date, so any original-year disclosure is visible before publishing.

## Product design and Impeccable workflow

Use the approved code-first approach. Create `PRODUCT.md` with confirmed audience, job, privacy boundaries, and constraints before implementation. Apply Impeccable's shape/new-work workflow within the approved direction. Record the finished design system in `DESIGN.md` after visual verification.

Build a friendly calendar workspace: white background, dark text, bold indigo accents, system sans-serif typography, and large tabular day counts.

The first viewport contains Between dates and Until a date modes, visible date inputs, and the result. A thin calendar strip explains the interval without replacing its numeric answer. Put saved events below the calculator. Age and anniversary modes keep the same layout and add warm copy and small original illustrations.

Use labelled native date controls with an accessible manual-entry fallback, visible keyboard focus, comfortable touch targets, and reduced-motion support. Avoid continuous motion, confetti, or forced onboarding. Saving/sharing must not obscure the calculation.

## Naming and original logo briefs

| Name | Rationale |
|---|---|
| **DayLah — recommended** | Covers differences, countdowns, birthdays, and anniversaries |
| DateLah | Broad and friendly, but could suggest dating |
| UntilLah | Strong countdown identity, less suitable for differences |
| CountLah | Flexible but less calendar-specific |

Recommended logo: a rounded **D calendar mark**, with two binding tabs and one highlighted date, using indigo with a dark wordmark.

Alternatives: **Linked dates**, two calendar dots joined by an arc; **Sunrise page**, a calendar page with a rising sun.

Create original SVG full-wordmark, symbol-only, monochrome, favicon, and app-icon variants during implementation. Match UnitLah's wordmark construction and icon proportions while retaining a distinct symbol/colour. Verify recognisability at 16–24 pixels. These are design briefs, not finished logo assets.

## Delivery milestones

1. **Foundation:** separate repository, product context, calendar module/tests, official holiday source verification, snapshot migration and API contracts.
2. **Local product:** all calculation modes, timezone handling, annual recurrence, local saved events, copy and privacy messaging.
3. **Sharing/offline:** immutable snapshots, preview, revocation, rate limits, holiday presets, PWA asset/dataset caching.
4. **Release:** prerendered public tool pages, SEO metadata, accessibility/responsive review, browser smoke tests, isolated CI/deployment.

Use a separate Go service and frontend build with PickLah's Nginx, systemd, and GitHub Actions deployment pattern. Isolate credentials/environments. Choose and verify a production domain before emitting canonical URLs. Validate Nginx configuration before reload, apply migrations before app rollout, and document rollback compatibility.

Prerender indexable tool pages using Vite and ship meaningful initial HTML, canonical URLs, metadata, and sitemap. Exclude personal query URLs and public shared countdowns from the sitemap and mark them `noindex`; public visibility is still possible for anyone holding a link.

Cache app assets and versioned holiday datasets; visibly identify cached coverage. Calculations/local events work offline; creating or revoking shares requires connectivity. Monitor process/database health and operational failures without logging titles, dates, private notes, or deletion tokens.

## Verification and acceptance criteria

- Test identical/reversed dates, inclusive counting, month/year boundaries, leap years, constrained month-end periods, and invalid/future birth dates.
- Test both February 29 policies, annual next occurrence, daylight-saving transitions, timezone midnight rollover, and tab resumption.
- Test holiday jurisdiction/observed-date labels, unavailable years, cached coverage, and source metadata.
- Test local save/edit/delete, storage failure, reload, offline behavior, clipboard fallback, and service-worker updates.
- Test share validation, privacy preview, immutable snapshots, public ID unpredictability, token authorization, revocation, unavailable links, request limits, and API/database failures.
- Run Go tests, frontend calendar tests, production builds, and browser smoke tests for principal flows.
- Meet WCAG 2.2 AA expectations for contrast, labels, keyboard access, focus, reduced motion, and accessible errors. Verify mobile date entry and no horizontal overflow.
- Follow Impeccable's bounded visual review: inspect desktop/mobile together, fix all findings in one batch, and confirm once.
- Release only when calendar answers are independent of DST, saved events remain local until explicit sharing, shared content matches the preview, and holiday coverage is stated honestly.

## Later roadmap

Consider accounts/cloud sync, reminders, business-day calculations, calendar integration, internationalization, ads outside the calculator, and Capacitor packaging after usage validates the need. Business-day support requires a separately specified jurisdiction and observed-holiday policy.
