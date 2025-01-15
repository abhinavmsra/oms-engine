# ========================
# Stage 1: Base Setup (Common Tools)
# ========================
FROM node:latest AS base

# Install PostgreSQL Client, Rust, and SQLx CLI
RUN apt update -y \
  && apt upgrade -y \
  && apt-get install -y --no-install-recommends postgresql-client curl \
  && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
  && export PATH="$HOME/.cargo/bin:$PATH" \
  && rustc --version \
  && cargo --version \
  && cargo install sqlx-cli --no-default-features --features native-tls,postgres

# Enable and configure PNPM
RUN corepack enable pnpm && corepack use pnpm@latest-10

WORKDIR /app

# ========================
# Stage 2: Development Build
# ========================
FROM base AS dev

ENV NODE_ENV=development
ENV APP_ENV=development

CMD ["tail", "-f /dev/null"]

# ========================
# Stage 3: Production Build
# ========================
FROM base AS build

ENV NODE_ENV=production
ENV APP_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

# Build the app
RUN pnpm run build

# Remove devDependencies
RUN pnpm prune --prod --no-optional

# ========================
# Stage 4: Production Runtime Image
# ========================
FROM node:22-alpine AS prod

# Set production environment and minimal setup
ENV NODE_ENV=production
ENV APP_ENV=production
ENV APP_ENV=production
ENV APP_PORT=3000

RUN apk add --no-cache curl openssl

USER node

WORKDIR /app

# Copy built files and production dependencies from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json .

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s \
  CMD curl --fail http://localhost:${APP_PORT}/api/health || exit 1

# Start the application using node
CMD ["node", "dist/index.js"]
