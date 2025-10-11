# --- STAGE 1: Build the Frontend (Using Debian-based image) ---
# Use the standard Node.js image (based on Debian, which uses glibc)
FROM node:20 as frontend-builder 
# Note: Removed '-alpine' for better compatibility

# Set the working directory for the frontend
WORKDIR /app/frontend

# Copy package.json and lock file FIRST for caching
COPY package*.json ./ 

# Use 'npm ci' for clean, repeatable installs, or npm install with the legacy flag
# The --legacy-peer-deps flag helps resolve the Rollup optional dependency bug.
RUN npm install --legacy-peer-deps
# OR: RUN npm ci  # (If you only use package-lock.json, prefer 'npm ci')

# Copy all source code
COPY . /app/frontend

# Build the Vite/JavaScript application
RUN npm run build 

# --- STAGE 2: Run the Node.js Backend (Still Alpine for smaller final image) ---
# Use a lightweight Alpine image for the final production server
FROM node:20-alpine 

# Set environment variables
ENV NODE_ENV production
ENV PORT 8080

# Set the working directory for the backend
WORKDIR /app/backend

# Copy backend application files
COPY package*.json ./
COPY backend/ ./backend/

# Install only the production dependencies for the backend
RUN npm install --only=production

# Copy the built frontend static assets from Stage 1 
COPY --from=frontend-builder /app/frontend/dist /app/backend/public 

# Define the command to start your Node.js backend server
CMD ["node", "backend/server.js"]