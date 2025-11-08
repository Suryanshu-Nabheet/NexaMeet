# Multi-stage build for production-ready NexaMeet

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY vite.config.ts tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY src ./src
COPY public ./public
COPY index.html ./
COPY tailwind.config.js postcss.config.js ./

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./
COPY server/tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy server source
COPY server/src ./src

# Build backend
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy built files
COPY --from=backend-builder /app/server/dist ./dist
COPY --from=frontend-builder /app/dist ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set permissions
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "dist/index.js"]

