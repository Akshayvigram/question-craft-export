# --- STAGE 1: Build the Frontend ---
FROM node:20-alpine as frontend-builder

# Set the working directory for the frontend
WORKDIR /app/frontend

# Copy package.json and install dependencies
COPY package*.json ./
# Assuming your backend and frontend dependencies are separate,
# you may need to adjust the paths below.
# If frontend dependencies are in a specific subfolder (e.g., 'src'):
# COPY package.json package-lock.json ./src/
# WORKDIR /app/frontend/src/

# Install dependencies (Node.js/Vite/TypeScript)
RUN npm install

# Copy all source code
COPY . /app/frontend

# Navigate to the correct directory (adjust path if needed, e.g., if code is under 'src')
WORKDIR /app/frontend 

# Build the Vite/JavaScript application
# This command runs your build script defined in package.json (e.g., "build": "vite build")
RUN npm run build 


# --- STAGE 2: Run the Node.js Backend ---
# Use a lightweight, production-ready Node.js image for the final container
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV production
# Cloud Run requires the app to listen on the port specified by the PORT environment variable.
ENV PORT 8080

# Set the working directory for the backend
WORKDIR /app/backend

# Copy backend application files (node.js, package.json, etc.)
# Copy only the necessary files to run the server
COPY package*.json ./
COPY backend/ ./backend/

# Install only the production dependencies for the backend
RUN npm install --only=production

# Copy the built frontend static assets from Stage 1 into the backend's public directory
# (Adjust the path to the backend's static file serving directory if necessary)
COPY --from=frontend-builder /app/frontend/dist /app/backend/public 


# Define the command to start your Node.js backend server
# Replace 'server.js' with the actual entry file for your Node.js application (e.g., 'index.js')
CMD ["node", "backend/server.js"]