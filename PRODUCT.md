# DayLah

## Platform
Web, responsive and offline-capable, plus a Capacitor Android app with bundled frontend assets.

## Audience and job
Confirmed by daylah-project-plan.md: global English-speaking visitors who want immediate date calculations and personal countdowns without registering. Malaysia and Singapore holiday presets have explicit source and coverage information.

## Stack
React, Vite, TypeScript, ordinary CSS; Go, Echo, GORM, PostgreSQL. Go API at repository root, frontend under frontend/. Match PickLah's handler/service/repository/router conventions and MuseCards (D:/Workspace/Go/gravure-model) deployment separation.

## Privacy and constraints
Local events and notes stay on the device (browser localStorage; Android Capacitor Preferences). Sharing requires a reviewed, explicit immutable public snapshot. Anonymous revocation uses a locally stored token. No accounts, analytics, payments, ads, business-day calculations, reminders or cloud sync.

## Brand commitments
Approved brief: white background, dark text, bold indigo, system sans-serif, large tabular day counts and a thin calendar interval strip. Code-first implementation. Rounded D calendar symbol. UnitLah currently has no implemented logo to match.

## Open release decisions
Production domain, host and credentials are not supplied. No canonical URL is emitted until a verified PUBLIC_SITE_URL is configured. Malaysian state coverage is partial and labelled.
