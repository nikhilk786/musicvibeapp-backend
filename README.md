# 🌿 Music Downloader (320 kbps Mobile-First App)

A premium, mobile-first Android & iOS audio extractor and downloader built with **Expo SDK 58 (Latest)**, **TypeScript**, and a lightweight streaming backend architecture.

Designed with an earthy aesthetic: **Dark Warm Charcoal (`#0c0e0c`)**, **Botanical Forest Green (`#10b981` / `#059669`)**, and **Mitti / Warm Sand (`#dcae7c` / `#e2b887`)**.

---

## 🎯 Architecture: Lightweight APK (<15MB)

Traditional React Native downloader apps bundle full C++ `FFmpeg` or Python runtimes directly inside the mobile binary, bloating APK sizes to **120MB - 180MB+**.

This app uses a **Hybrid Streaming Architecture**:
1. **Lightweight Client (<15MB APK)**:
   - Built with pure React Native & Expo primitives.
   - Zero bulky C++ libraries or Python engines bundled into the client binary.
   - Streams audio chunks directly using `expo-file-system` with live progress tracking (`0% ➔ 100%`).
   - Automatically saves downloaded MP3s directly to the Android MediaStore (`Music/` directory) and creates a native "Music Downloader" album via `expo-media-library`.
2. **Server-Side Transcoding Engine (`server/index.mjs`)**:
   - Spawns `yt-dlp` to extract media streams without video overhead.
   - Pipes directly into system `ffmpeg` to encode into strict **320 kbps CBR MP3** (`-codec:a libmp3lame -b:a 320k -id3v2_version 3`) on the fly.
   - Streams chunked `audio/mpeg` with real-time transfer to the mobile app.

---

## 📱 Features

- **Single Locked Bitrate**: Strict 320 kbps Ultra HD audio — no confusing low-bitrate options.
- **One-Tap Clipboard Paste**: Instant URL detection using `expo-clipboard` with checkmark feedback.
- **Tactile Haptic Feedback**: Integrated `expo-haptics` on taps, extraction completion, and download success.
- **Offline / Demo Mode**: Built-in 1-tap "Insert Demo URL" that extracts sample tracks and streams 320 kbps audio offline.
- **Live Progress Visualizer**: Multi-stop botanical-to-mitti gradient progress bar with downloaded MBs counter (`X.X MB / Y.Y MB`).
- **Native Android & iOS MediaStore**: Saves directly into native music storage, making tracks instantly playable in Samsung Music, YouTube Music, VLC, or Spotify.

---

## 📂 Project Structure

```
├── App.tsx                     # Main application & reactive state machine
├── app.json                    # Expo SDK 58 & Android/iOS permissions config
├── eas.json                    # Standalone APK build configuration
├── package.json                # Dependencies & scripts
├── tsconfig.json               # Strict TypeScript configuration
├── constants/
│   └── theme.ts                # Earthy charcoal, botanical moss & mitti palette
├── types/
│   └── audio.ts                # MediaMetadata, DownloadProgress, DownloadStatus
├── services/
│   ├── apiService.ts           # Metadata fetching & download stream resolver
│   ├── downloadService.ts      # FileSystem chunked downloader & MediaLibrary saver
│   └── deviceUtils.ts          # Clipboard paste & Haptics triggers
├── components/
│   ├── Header.tsx              # Brand logo, locked 320 kbps badge, pulse indicator
│   ├── HeroSection.tsx         # Gradient typography & feature pills
│   ├── UrlInputCard.tsx        # Link input, paste button, demo filler & submit
│   ├── PreviewCard.tsx         # Media preview, waveform fallback, source badge
│   ├── DownloadProgressBar.tsx # Gradient progress bar & live MB counter
│   ├── SuccessModal.tsx        # Completion banner & MediaStore save summary
│   └── ErrorBanner.tsx         # Graceful error handler with retry action
└── server/
    └── index.mjs               # Node.js + yt-dlp + ffmpeg 320 kbps streaming server
```

---

## 🚀 Quick Start Guide

### 1. Start the Audio Streaming Backend
```bash
npm run server
```
The server will start on `http://0.0.0.0:5005`:
- **Health Check**: `GET http://localhost:5005/api/health`
- **Metadata**: `GET http://localhost:5005/api/info?url=<media_url>`
- **Stream**: `GET http://localhost:5005/api/download?url=<media_url>&title=<title>`

### 2. Start the Expo App
In a new terminal window:
```bash
npx expo start
```
- Press `a` to open on an Android emulator or scan the QR code with **Expo Go** on an Android device.
- Press `i` to open on an iOS simulator.
- Press `w` to run directly in the web browser.

---

## 📦 Building the Standalone Android APK (<15MB)

To generate a standalone `.apk` that can be directly installed on any Android phone without Expo Go:

1. Log in to your Expo account:
   ```bash
   npx eas-cli login
   ```
2. Build the standalone APK:
   ```bash
   npx eas-cli build -p android --profile preview
   ```
   *The `preview` profile defined in `eas.json` specifies `"buildType": "apk"`.*
