#!/bin/bash
#
# Pulls the latest built site from GitHub Releases and deploys it into
# public_html. Runs on the cPanel server via a Cron Job. No inbound
# connection from GitHub is needed, so the server firewall is irrelevant.
#
# Install:
#   1. Put this file at /home/sacredca/server-pull.sh
#   2. chmod +x /home/sacredca/server-pull.sh
#   3. Add a cPanel Cron Job (e.g. every 5 min):
#        */5 * * * * /home/sacredca/server-pull.sh >> /home/sacredca/deploy.log 2>&1
#
set -euo pipefail

URL="https://github.com/io94/react-saka/releases/download/live/site.tar.gz"
WEBROOT="$HOME/public_html"
WORK="$HOME/.deploy-work"
ETAG="$HOME/.deploy-etag"
TARBALL="$WORK/site.tar.gz"

mkdir -p "$WORK"

# Download only if the release asset changed since last time (ETag / If-None-Match).
HTTP="$(curl -sSL \
  --etag-compare "$ETAG" --etag-save "$ETAG" \
  -o "$TARBALL" -w '%{http_code}' \
  "$URL")"

# 304 = unchanged (curl leaves the output file empty). Nothing to do.
if [ "$HTTP" = "304" ] || [ ! -s "$TARBALL" ]; then
  echo "$(date '+%F %T') no change (HTTP $HTTP)"
  exit 0
fi

# Fresh build: extract to a clean staging dir.
rm -rf "$WORK/extract"
mkdir -p "$WORK/extract"
tar -xzf "$TARBALL" -C "$WORK/extract"

# Deploy into the web root. --delete removes stale files, but we keep the
# server-managed bits that must never be touched.
rsync -a --delete \
  --exclude='.well-known' \
  --exclude='.htaccess' \
  --exclude='.ftpquota' \
  --exclude='cgi-bin' \
  "$WORK/extract/" "$WEBROOT/"

echo "$(date '+%F %T') deployed (HTTP $HTTP)"
