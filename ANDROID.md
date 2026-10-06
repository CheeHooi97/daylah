# Android (Capacitor)

The React frontend is packaged locally by Capacitor 8.5.1 under `frontend/android/`, with app ID `my.daylah.app`. No remote WebView hosting or database credentials are embedded in the APK. App IDs can be changed before a store release.

## Build

Use Node 24+, JDK 21, Android SDK 36, and the generated Gradle 8.14.3 wrapper. The installed Android Studio JDK may be newer than Gradle supports; point JAVA_HOME at JDK 21.

```powershell
cd frontend
npm ci
# Point these to your installed JDK 21 and Android SDK:
$env:JAVA_HOME='C:\path\to\jdk-21'
$env:ANDROID_HOME='C:\path\to\Android\Sdk'
npm run cap:sync
npm run android:debug
```

The debug APK is `frontend/android/app/build/outputs/apk/debug/app-debug.apk`. `npm run cap:android` opens Android Studio. Release signing, store upload and device installation are separate steps; the debug APK is not a signed store release.

## Public backend

Copy `frontend/.env.mobile.example` to `.env.mobile.local` and set both origins to your verified public HTTPS hosts:

- `VITE_API_BASE_URL`: origin serving the Go API; the client appends `/v1`.
- `VITE_PUBLIC_SITE_URL`: website origin used for public countdown links.

Both may use the same host when Nginx proxies `/v1`. Do not use localhost as the public backend: on Android it refers to the device. Rebuild and sync after configuring. When unconfigured, calculations and private saves work offline; public sharing gives an explicit unavailable message and does not create a snapshot.

Backend CORS allows `https://localhost`, Capacitor Android's bundled-asset origin, and the Content-Type/Authorization headers required for publication and revocation. Override `NATIVE_ORIGINS` with an explicit comma-separated allowlist if needed. No wildcard or credentialed CORS is enabled. HTTPS is used for the native WebView and remote API.

## Storage and lifecycle

The privacy policy is a standalone HTML page at `https://daylah.my/privacy/` once the website build is hosted. It is linked from the app footer and bundled at `privacy/index.html` for offline access on Android. Its contact section uses the app's Google Play developer support contact; replace this with a direct monitored support email when provided. Website publication is separate from the backend-only deployment.

Private events, notes and anonymous revocation tokens persist in Capacitor Preferences on Android. Existing native WebView localStorage records are copied into Preferences once per missing key. The browser continues using localStorage. Android OS backup is disabled to preserve the device-local boundary; uninstalling the app or clearing its data removes private saves and revocation access.

Clipboard uses the native Clipboard plugin; owned-link sharing uses Android's share sheet. On app resume, timezone/day calculations refresh. Android Back returns from a section anchor to the calculator; at the root it minimizes the app. Native assets are bundled for offline operation, and the web service worker is disabled inside native builds.

## PostgreSQL

Public snapshots use the PostgreSQL table `daylah`. Run `go run . migrate` against the configured DATABASE_URL. Migration 002 renames the old countdown table without losing rows and adds an updatable compatibility view for old API binaries. Schema migrations are canonical under migrations/ and embedded into the binary.

The target live database and public domain are not yet provided. Migration checks used an isolated workspace PostgreSQL instance and did not modify existing user databases.
