export interface MediaMetadata {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  durationFormatted: string; // e.g. "3:45"
  thumbnail: string | null;
  source: string; // "YouTube" | "SoundCloud" | "Web Stream"
  bitrate: '320 kbps';
  qualityBadge: string;
  estimatedSizeMb: string;
  url: string;
}

export interface DownloadProgress {
  totalBytes: number;
  bytesDownloaded: number;
  percentage: number; // 0 to 100
  downloadedMb: string;
  totalMb: string;
}

export type DownloadStatus =
  | 'idle'
  | 'fetching_info'
  | 'ready'
  | 'downloading'
  | 'saving'
  | 'completed'
  | 'error';

export interface DownloadResult {
  localUri: string;
  assetUri?: string;
  filename: string;
  fileSizeBytes: number;
}

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  durationFormatted: string;
  thumbnail: string | null;
  url: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress?: number;
}

export interface PlaylistMetadata {
  id: string;
  title: string;
  trackCount: number;
  tracks: PlaylistTrack[];
}
