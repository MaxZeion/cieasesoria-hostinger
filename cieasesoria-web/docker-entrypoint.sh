#!/bin/sh

# Load environment variables from .env file if it exists
if [ -f /app/.env ]; then
    echo "Loading environment variables from .env..."
    export $(grep -v '^#' /app/.env | xargs)
fi

# Start Astro dev server
exec pnpm run dev --host 0.0.0.0
