FROM node:23-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && ls

# Copy compiled code (shared folder included in build)
COPY ./dist ./dist
COPY ./.env ./.env

EXPOSE 3000
CMD ["npm", "run", "prod"]
