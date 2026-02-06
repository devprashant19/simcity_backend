FROM node:18-alpine

WORKDIR /app

# Install dependencies based on package files
COPY package*.json ./
RUN npm install --production

# Copy application source
COPY . .

# Expose port (Cloud Run sets PORT env var)
EXPOSE 8080

# Start command
CMD [ "node", "server.js" ]
