FROM node:20-bullseye-slim

# Install system dependencies: ffmpeg, python3, curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Install latest yt-dlp binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
 && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Copy server package and install dependencies
COPY server/package*.json ./
RUN npm install --production

# Copy server code
COPY server/ ./

ENV PORT=10000
EXPOSE 10000

CMD ["node", "index.mjs"]
