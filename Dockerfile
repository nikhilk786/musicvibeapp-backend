FROM node:20-alpine

# Install system dependencies: ffmpeg, python3, curl, ca-certificates
RUN apk add --no-cache ffmpeg python3 curl ca-certificates

# Install latest yt-dlp binary (runs seamlessly with python3)
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
 && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Copy server package and install dependencies
COPY server/package*.json ./
RUN npm install --production

# Copy server source code
COPY server/ ./

ENV PORT=10000
EXPOSE 10000

CMD ["node", "index.mjs"]
