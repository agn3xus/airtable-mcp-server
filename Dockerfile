# Multi-stage build for agnexus Cloud Run deployment
# Stage 1: Build
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install project dependencies
RUN npm ci --only=production=false

# Copy the entire project directory
COPY . .

# Build the project
RUN npm run build

# Stage 2: Production image (minimal)
FROM node:24-alpine AS release

# Add MCP registry validation label
LABEL io.modelcontextprotocol.server.name="io.github.domdomegg/airtable-mcp-server"

# Set working directory
WORKDIR /app

# Copy only production dependencies and built files
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Cloud Run requirement: expose port 8080
EXPOSE 8080

# Set environment variable for HTTP transport (Cloud Run deployment)
ENV MCP_TRANSPORT=http

# Run the server (binds to 0.0.0.0:8080 as hardcoded in main.ts)
ENTRYPOINT ["node", "dist/main.js"]
