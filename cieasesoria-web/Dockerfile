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

# Build the project
RUN pnpm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy the build output from the builder stage
# Default Astro output directory is dist/
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Custom Nginx config can be copied here if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
