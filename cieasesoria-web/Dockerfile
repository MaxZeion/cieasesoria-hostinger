# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack to use pnpm
RUN corepack enable

# Copy package files to install dependencies first (caching)
COPY package.json pnpm-lock.yaml ./

# Install dependencies with frozen lockfile (strict versioning)
RUN pnpm install --frozen-lockfile

# Copy the rest of the code
COPY . .

# Build-time arguments for Astro PUBLIC_* variables
# These are embedded during build (import.meta.env.PUBLIC_*)
ARG PUBLIC_RECAPTCHA_SITE_KEY
ENV PUBLIC_RECAPTCHA_SITE_KEY=$PUBLIC_RECAPTCHA_SITE_KEY

# Build the project (creates dist/ with server and client)
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Enable corepack to use pnpm
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Astro Node adapter runs on port 4321 by default
ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321

# Start the Node.js server
CMD ["node", "./dist/server/entry.mjs"]
