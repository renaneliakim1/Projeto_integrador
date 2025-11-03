# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server (não build para produção)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
