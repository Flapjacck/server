# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN pnpm run build

# Stage 2: Dependencies (production only)
FROM node:20-alpine AS prod-deps

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Stage 3: Runtime
FROM node:20-alpine

WORKDIR /app

# Install Python 3 + pip + pytest tools for sandboxed code execution
# pytest-json-report: structured JSON output for result parsing
# pytest-timeout: kill runaway user code after N seconds
RUN apk add --no-cache python3 py3-pip && \
    pip3 install --break-system-packages \
      pytest \
      pytest-json-report \
      pytest-timeout

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy production node_modules from deps stage
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist
COPY package.json ./
COPY scripts/docker-healthcheck.cjs ./scripts/docker-healthcheck.cjs
# Challenge runner: pytest suites and downloadable starter templates
COPY tests/challenges ./tests/challenges
COPY templates/challenges ./templates/challenges

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD ["node", "scripts/docker-healthcheck.cjs"]

# Start server
CMD ["node", "dist/index.js"]
