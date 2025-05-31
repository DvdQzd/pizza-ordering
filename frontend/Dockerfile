FROM node:18-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 5173

# Set environment variables for Vite
ENV VITE_BFF_URL=http://localhost:3000
ENV HOST=0.0.0.0
ENV PORT=5173

# Start in development mode
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 