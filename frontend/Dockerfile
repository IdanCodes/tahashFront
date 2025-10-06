# Frontend Dockerfile for production

# Stage 1: Build the frontend
FROM node:20 AS build
WORKDIR /app

# Copy package files and clean install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and shared folder
COPY frontend/. ./
COPY shared/. ../shared/

# Environment variables
ENV VITE_API_HOST="backend"

# Build static assets
RUN npm run build

# Stage 2: Server with Nginx
FROM nginx:stable-alpine

# Copy Nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# TODO: create a different Dockerfile (Dockerfile.dev or something) with hot reload (npm run dev) instead of a static nginx server
# Expose Vite dev server
#EXPOSE 5173
# CMD ["npm", "run", "dev"]
