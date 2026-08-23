FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY tests ./tests
# Old checkouts may still have String Bay files; do not compile them.
RUN rm -f src/db.ts src/routes/strings.ts src/middleware/apiKeyAuth.ts

FROM deps AS test

RUN npm test

FROM deps AS build

RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
