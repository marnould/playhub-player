FROM node:18-alpine AS build
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps --force
RUN node -v && npm -v
# Copy the entire project directory
# This step is crucial - we need all source files for the build
COPY . .

# Build with environment variables properly set
ENV NODE_ENV=production
ENV CI=false
RUN npm run build
CMD ["npm", "start"]

# Production image
FROM nginx:alpine
# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
