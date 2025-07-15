# Base image
FROM node:20

# Install netcat for health check
RUN apt-get update && apt-get install -y netcat-openbsd

# Set working directory
WORKDIR /usr/src/app

# Copy package.json + install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . ./

# Give execute permission to entrypoint script
RUN chmod +x ./entrypoint.sh

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Run entrypoint script
# This script can be used to run migrations, seed data, etc.
CMD ["sh", "./entrypoint.sh"]