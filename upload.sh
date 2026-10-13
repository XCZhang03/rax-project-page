#!/bin/bash
# Upload a file to the RAX project R2 bucket
# Usage: ./upload.sh <local-file> <remote-path> [content-type]
#
# Examples:
#   ./upload.sh video.mp4 static/video.mp4 video/mp4
#   ./upload.sh figure.png figures/figure.png image/png
#
# Setup: set CLOUDFLARE_API_TOKEN in your environment
#   export CLOUDFLARE_API_TOKEN="your-token-here"

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./upload.sh <local-file> <remote-path> [content-type]"
    echo "Example: ./upload.sh demo.mp4 static/demo.mp4 video/mp4"
    exit 1
fi

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "Error: CLOUDFLARE_API_TOKEN not set"
    echo "Get it from the team, then: export CLOUDFLARE_API_TOKEN=\"your-token\""
    exit 1
fi

LOCAL_FILE="$1"
REMOTE_PATH="$2"
CONTENT_TYPE="${3:-application/octet-stream}"

if [ ! -f "$LOCAL_FILE" ]; then
    echo "Error: File not found: $LOCAL_FILE"
    exit 1
fi

echo "Uploading $LOCAL_FILE -> https://assets.robot-agent-exploration.com/$REMOTE_PATH"
npx wrangler r2 object put "rax-assets/$REMOTE_PATH" \
    --file "$LOCAL_FILE" \
    --content-type "$CONTENT_TYPE" \
    --remote

echo "Done: https://assets.robot-agent-exploration.com/$REMOTE_PATH"
