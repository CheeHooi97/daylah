#!/usr/bin/env bash
set -euo pipefail

release_id="${1:-}"
[[ "$release_id" =~ ^[0-9a-f]{40}-[0-9]+-[0-9]+$ ]] || { echo 'Invalid release ID' >&2; exit 1; }
staging="/tmp/daylah-deploy-$release_id"
release="/opt/daylah/releases/$release_id"
test -s "$staging/release.tgz" || { echo 'Missing uploaded release archive' >&2; exit 1; }
test -s /etc/daylah/daylah.env || { echo 'Missing /etc/daylah/daylah.env: run deploy/setup-server.sh and configure the server environment first' >&2; exit 1; }
test -f /etc/systemd/system/daylah-api.service || { echo 'Missing daylah-api.service: run deploy/setup-server.sh first' >&2; exit 1; }
install -d -m 755 /opt/daylah/releases
mkdir -m 755 -- "$release"
tar --no-same-owner -xzf "$staging/release.tgz" -C "$release"
test -s "$release/daylah-api"
chmod 755 "$release/daylah-api"
previous="$(readlink -f /opt/daylah/current 2>/dev/null || true)"
# Load credentials through systemd, never through a release or Actions runner.
systemd-run --quiet --wait --collect --unit="daylah-migrate-$release_id" \
  --property=User=daylah --property=Group=daylah \
  --property=EnvironmentFile=/etc/daylah/daylah.env \
  --property="WorkingDirectory=$release" "$release/daylah-api" migrate

ln -s "$release" /opt/daylah/current.next
mv -Tf /opt/daylah/current.next /opt/daylah/current
healthy=false
if systemctl restart daylah-api; then
  for attempt in {1..20}; do
    if systemctl is-active --quiet daylah-api && curl -fsS --max-time 3 http://127.0.0.1:8092/healthz -o /dev/null; then
      healthy=true
      break
    fi
    sleep 2
  done
fi
if [[ "$healthy" != true ]]; then
  if [[ "$previous" == /opt/daylah/releases/* && -s "$previous/daylah-api" ]]; then
    ln -s "$previous" /opt/daylah/current.rollback
    mv -Tf /opt/daylah/current.rollback /opt/daylah/current
    systemctl restart daylah-api || true
    echo 'Restored previous release; schema changes are not rolled back.' >&2
  else
    systemctl stop daylah-api || true
  fi
  echo 'Deployment failed: API did not become ready.' >&2
  exit 1
fi
echo "Published DayLah release $release_id"
