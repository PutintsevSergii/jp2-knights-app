FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

RUN corepack enable

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY libs/auth/provider/package.json libs/auth/provider/package.json
COPY libs/shared/auth/package.json libs/shared/auth/package.json
COPY libs/shared/design-tokens/package.json libs/shared/design-tokens/package.json
COPY libs/shared/i18n/package.json libs/shared/i18n/package.json
COPY libs/shared/types/package.json libs/shared/types/package.json
COPY libs/shared/validation/package.json libs/shared/validation/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS builder

COPY . .

RUN pnpm nx run admin:typecheck
RUN pnpm nx run admin:build

FROM base AS runner

ENV NODE_ENV="production"
ENV APP_RUNTIME_MODE="api"
ENV PORT="8080"
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=node:node /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/admin/package.json ./apps/admin/package.json
COPY --from=builder --chown=node:node /app/apps/admin/next.config.mjs ./apps/admin/next.config.mjs
COPY --from=builder --chown=node:node /app/apps/admin/.next ./apps/admin/.next
COPY --from=builder --chown=node:node /app/libs ./libs

USER node
EXPOSE 8080

CMD ["pnpm", "--dir", "apps/admin", "start"]
