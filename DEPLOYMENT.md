# Backend deployment

DayLah's backend-only workflow targets the same server as PickLah (`157.245.200.202`). No website, domain, frontend build or nginx change is required. DayLah uses its own system account, database and `/opt/daylah` release directories.

Run `deploy/setup-server.sh` as root once. Configure `/etc/daylah/daylah.env` (mode 600) with the dedicated daylah database credentials and `SERVER_ADDRESS=127.0.0.1:8092`. Confirm port 8092 is unused before installation. Keep this port on loopback until an HTTPS API endpoint is configured. The existing PickLah services are not changed.

The manually triggered `.github/workflows/deploy.yml` builds the Linux backend, uploads a release archive, applies migrations with systemd, switches the current release and checks `http://127.0.0.1:8092/healthz`. A failed readiness check restores the previous binary. Configure production secrets `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`; `DEPLOY_HOST` defaults to the shared server and `DEPLOY_PORT` defaults to 22. `DEPLOY_ARCH` defaults to amd64.

For a direct deployment, use the same setup and publisher scripts over a verified SSH connection. Credentials stay in the server environment file, not the release archive or Git. Database migrations never roll back during binary rollback.

A running loopback backend alone is not accessible from an Android phone. Native online functionality will need an HTTPS API address or a development SSH tunnel. Offline dates and calculations do not need it. Sharing remains disabled in the UI.

The website deployment can be configured later using `deploy/daylah.conf`; it is not part of this backend-only workflow.

## Installed backend (6 October 2026)

Backend deployed directly to the shared server. `daylah-api` is active and `/healthz` succeeds on port 8092. PostgreSQL connects via 127.0.0.1 with TLS on the same host; the public database address was not reachable from the server itself. PickLah remains active. No website or public API proxy has been published.

For development access without publishing a website, forward the server API over SSH:

```powershell
ssh -N -L 8080:127.0.0.1:8092 -o StrictHostKeyChecking=yes -i "$env:USERPROFILE/.ssh/picklah_deploy" root@157.245.200.202
```

Local port 8080 must be free. The frontend's existing Vite proxy then reaches the deployed API through the tunnel. This does not expose PostgreSQL or the API publicly. A physical Android device still needs device-to-host forwarding or a public HTTPS API.
