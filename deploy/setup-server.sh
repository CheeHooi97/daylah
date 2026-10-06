#!/usr/bin/env bash
set -euo pipefail
[[ "$EUID" == 0 ]] || { echo 'Run with sudo.' >&2; exit 1; }
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
id daylah >/dev/null 2>&1 || useradd --system --home-dir /opt/daylah --shell /usr/sbin/nologin daylah
install -d -m 755 /opt/daylah /opt/daylah/releases
install -d -m 700 /etc/daylah
if [[ ! -e /etc/daylah/daylah.env ]]; then
  install -m 600 "$script_dir/daylah.env.example" /etc/daylah/daylah.env
fi
install -m 644 "$script_dir/daylah-api.service" /etc/systemd/system/daylah-api.service
systemctl daemon-reload
systemctl enable daylah-api
echo 'Configure /etc/daylah/daylah.env before publishing a backend release.'
