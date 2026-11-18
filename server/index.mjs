import express from 'express';
import cors from 'cors';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const YTDLP_BIN = fs.existsSync('/tmp/yt-dlp') ? '/tmp/yt-dlp' : 'yt-dlp';
const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

// Helper to format seconds to mm:ss
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '3:30';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Helper to sanitize filename
function sanitizeFilename(title) {
  return (title || 'audio_320kbps')
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 80);
}

// 1. Health check endpoint
app.get('/api/health', async (req, res) => {
  let ytDlpInstalled = false;
  let ffmpegInstalled = false;

  try {
    await execAsync('yt-dlp --version');
    ytDlpInstalled = true;
  } catch (e) {}

  try {
    await execAsync('ffmpeg -version');
    ffmpegInstalled = true;
  } catch (e) {}

  res.json({
    status: 'online',
    version: '1.0.0',
    audioQuality: '320 kbps CBR MP3',
    tools: {
      ytDlp: ytDlpInstalled,
      ffmpeg: ffmpegInstalled,
    },
    message: 'Ultra HD 320 kbps Streaming Backend Ready'
  });
});

// 2. Metadata extraction endpoint
app.get('/api/info', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Handle Demo / Test URL for instant offline testing
  if (url.includes('demo') || url.includes('test') || url.includes('sample')) {
    return res.json({
      id: 'demo-track-320',
      title: 'Emerald Resonance (Botanical 320 kbps Master)',
      artist: 'Forest Echoes',
      duration: 195,
      durationFormatted: '3:15',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
      source: 'SoundCloud',
      bitrate: '320 kbps',
      qualityBadge: 'Ultra HD 320 kbps',
      estimatedSizeMb: '7.8 MB',
      url: url
    });
  }

  try {
    // Execute yt-dlp to extract metadata in JSON format
    const { stdout } = await execAsync(
      `${YTDLP_BIN} --dump-single-json --no-playlist --skip-download "${url}"`,
      { timeout: 20000, maxBuffer: 10 * 1024 * 1024 }
    );

    const data = JSON.parse(stdout);
    const durationSec = data.duration || 210;
    // 320 kbps = 40 KB/s => approx size in MB = (seconds * 40) / 1024
    const approxMb = ((durationSec * 40) / 1024).toFixed(1);

    res.json({
      id: data.id || 'audio',
      title: data.title || 'Unknown Track',
      artist: data.uploader || data.artist || data.creator || 'Featured Artist',
      duration: durationSec,
      durationFormatted: formatDuration(durationSec),
      thumbnail: data.thumbnail || (data.thumbnails && data.thumbnails.length > 0 ? data.thumbnails[data.thumbnails.length - 1].url : null),
      source: data.extractor_key || 'Web Stream',
      bitrate: '320 kbps',
      qualityBadge: 'Ultra HD 320 kbps',
      estimatedSizeMb: `${approxMb} MB`,
      url: url
    });
  } catch (err) {
    console.error('Extraction error:', err.message);
    res.status(500).json({
      error: 'Failed to extract metadata. Ensure the URL is valid and publicly accessible.',
      details: err.message
    });
  }
});

// 3. Audio Streaming & 320 kbps Transcoding endpoint
app.get('/api/download', async (req, res) => {
  const { url, title } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  const safeTitle = sanitizeFilename(title);

  // If Demo / Offline mode: generate a high-fidelity synthetic 320 kbps audio stream with harmonic warmth
  if (url.includes('demo') || url.includes('test') || url.includes('sample')) {
    console.log('[Stream] Generating Demo 320 kbps MP3 stream...');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.mp3"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('X-Audio-Bitrate', '320kbps');

    const ffmpegDemo = spawn('ffmpeg', [
      '-f', 'lavfi',
      '-i', 'anoisesrc=d=20:c=pink:r=44100:a=0.03,lowpass=f=800[bg];sine=frequency=432:duration=20[s1];sine=frequency=216:duration=20[s2];[bg][s1][s2]amix=inputs=3:dropout_transition=2',
      '-codec:a', 'libmp3lame',
      '-b:a', '320k',
      '-id3v2_version', '3',
      '-metadata', 'title=Emerald Resonance (Botanical 320 kbps)',
      '-metadata', 'artist=Forest Echoes',
      '-metadata', 'album=Mitti Earth Sessions',
      '-f', 'mp3',
      'pipe:1'
    ]);

    ffmpegDemo.stdout.pipe(res);
    ffmpegDemo.stderr.on('data', () => {});
    ffmpegDemo.on('close', () => {
      console.log('[Stream] Demo 320 kbps stream finished.');
    });
    req.on('close', () => {
      ffmpegDemo.kill();
    });
    return;
  }

  try {
    console.log(`[Stream] Processing real audio from: ${url}`);
    
    // Pipe 1: yt-dlp extracts raw audio stream to stdout
    const ytdl = spawn(YTDLP_BIN, [
      '-f', 'bestaudio/best',
      '-o', '-',
      '--no-playlist',
      '--no-warnings',
      url
    ]);

    // Pipe 2: ffmpeg receives yt-dlp stream via pipe:0 and encodes to 320 kbps CBR MP3
    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-vn', // No video
      '-codec:a', 'libmp3lame',
      '-b:a', '320k', // Strict 320 kbps CBR
      '-ar', '44100', // 44.1 kHz standard
      '-id3v2_version', '3',
      '-metadata', `title=${title || 'Downloaded Audio'}`,
      '-f', 'mp3',
      'pipe:1'
    ]);

    // Prevent uncaught EPIPE
    ffmpeg.stdin.on('error', () => {});
    ytdl.stdout.on('error', () => {});

    ytdl.stdout.pipe(ffmpeg.stdin);

    let headersSet = false;
    ffmpeg.stdout.on('data', (chunk) => {
      if (!headersSet) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.mp3"`);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('X-Audio-Bitrate', '320kbps');
        headersSet = true;
      }
      res.write(chunk);
    });

    ffmpeg.stdout.on('end', () => {
      res.end();
    });

    ytdl.stderr.on('data', (d) => {});
    ffmpeg.stderr.on('data', (d) => {});

    req.on('close', () => {
      ytdl.kill();
      ffmpeg.kill();
    });

    ffmpeg.on('close', (code) => {
      console.log(`[Stream] Transcoding completed with code ${code}`);
    });

    ytdl.on('error', (err) => {
      console.error('[yt-dlp error]', err);
      if (!headersSet && !res.headersSent) res.status(500).json({ error: 'Stream extraction error' });
    });

    ffmpeg.on('error', (err) => {
      console.error('[ffmpeg error]', err);
      if (!headersSet && !res.headersSent) res.status(500).json({ error: 'Transcoding error' });
    });

  } catch (err) {
    console.error('Stream spawn error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream audio' });
    }
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌿 [Server Ready] 320 kbps Audio Streaming Backend listening on http://0.0.0.0:${PORT}`);
  console.log(`👉 Health: http://localhost:${PORT}/api/health`);
  console.log(`👉 Demo Info: http://localhost:${PORT}/api/info?url=demo`);
  console.log(`👉 Demo Stream: http://localhost:${PORT}/api/download?url=demo&title=Emerald_Resonance\n`);
});
