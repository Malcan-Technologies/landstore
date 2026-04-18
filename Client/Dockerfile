FROM node:20-alpine

WORKDIR /app

# ✅ Build-time variables (Next.js NEEDS these before build)
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Install deps
COPY package*.json ./
RUN npm install

# Copy app
COPY . .

# ✅ Build after env is set
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
