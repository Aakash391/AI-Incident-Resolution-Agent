FROM node:22-bookworm-slim

# --------------------------------------------------
# Working directory
# --------------------------------------------------

WORKDIR /workspace/ai-incident-resolution-agent/frontend

# --------------------------------------------------
# Copy package files
# --------------------------------------------------

COPY frontend/package*.json ./

# --------------------------------------------------
# Install dependencies
#
# npm install is intentionally used instead of npm ci
# because the frontend may not have a synchronized
# package-lock.json yet.
# --------------------------------------------------

RUN npm install

# --------------------------------------------------
# Copy frontend source
# --------------------------------------------------

COPY frontend/ .

# --------------------------------------------------
# Next.js development server
# --------------------------------------------------

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]