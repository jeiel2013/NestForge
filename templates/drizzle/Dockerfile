# --- Base ---
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

# --- Dependencies ---
FROM base AS deps

RUN npm ci

# --- Development ---
FROM deps AS development

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

# --- Build ---
FROM deps AS build

COPY . .

RUN npm run build
RUN npm prune --omit=dev

# --- Production ---
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/main.js"]