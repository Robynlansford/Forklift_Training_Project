#!/bin/bash
# push_frame.sh <local-png> <url-file>
# PUTs a boundary frame to a Higgsfield presigned URL, then report the HTTP code.
# The URL is read from a file because presigned S3 URLs contain characters that
# do not survive shell interpolation reliably.
set -euo pipefail
cd "$(dirname "$0")"
FILE="$1"
URLFILE="$2"
code=$(curl -s -o /dev/null -w '%{http_code}' \
        -X PUT -H 'Content-Type: image/png' \
        --data-binary "@${FILE}" "$(cat "$URLFILE")")
echo "upload ${FILE} -> HTTP ${code}"
[ "$code" = "200" ] || exit 1
