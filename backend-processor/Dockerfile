FROM node:18-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . ./

# Build TypeScript (if using NestJS)
RUN npm run build || echo "TypeScript build failed, using fallback"

# Default to Node.js simple processor, but can be overridden
CMD ["npm", "start"] 