# Use Node.js base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy files
COPY package*.json ./
COPY index.js ./

# Install dependencies
RUN npm install

# Expose port
EXPOSE 5005

# Start the app
CMD ["node", "index.js"]
