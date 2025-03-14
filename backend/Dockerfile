# Use Node.js LTS
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image
FROM node:18-slim AS runner

WORKDIR /app

# Install OpenSSL and required dependencies
RUN apt-get update -y && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/start.sh ./start.sh

# Make start script executable
RUN chmod +x ./start.sh

# Install production dependencies
RUN npm ci --only=production

# Generate Prisma client in production
RUN npx prisma generate

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5051

# Expose port
EXPOSE 5051

# Start the application using the startup script
CMD ["./start.sh"] 