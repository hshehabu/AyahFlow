'use client';

import { useEffect, useRef, useState } from 'react';

interface Video {
  id: number;
  file_id: string;
  caption: string | null;
  message_id: number;
  posted_at: string;
}

interface VideoPlayerProps {
  video: Video;
  isActive: boolean;
}

export default function VideoPlayer({ video, isActive }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch video URL
  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        const response = await fetch(`/api/video-url?file_id=${encodeURIComponent(video.file_id)}`);
        if (!response.ok) throw new Error('Failed to get video URL');
        
        const data = await response.json();
        setVideoUrl(data.url);
      } catch (err) {
        console.error('Error fetching video URL:', err);
        setError('Failed to load video');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoUrl();
  }, [video.file_id]);

  // Auto-play/pause based on visibility
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !videoUrl) return;

    if (isActive) {
      videoElement.play().catch((err) => {
        console.error('Error playing video:', err);
      });
    } else {
      videoElement.pause();
    }
  }, [isActive, videoUrl]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getTheme = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      return window.Telegram.WebApp.colorScheme || 'dark';
    }
    return 'dark';
  };

  const theme = getTheme();
  const bgColor = theme === 'dark' ? '#000000' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#000000';

  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        Loading video...
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        {error || 'Video not available'}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: bgColor,
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        muted={isMuted}
        playsInline
        loop
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        onError={(e) => {
          console.error('Video playback error:', e);
          setError('Failed to play video');
        }}
      />
      
      {/* Mute/Unmute button */}
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          border: 'none',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
        }}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Caption overlay */}
      {video.caption && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '20px',
            right: '20px',
            padding: '12px 16px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.5',
            maxHeight: '30%',
            overflow: 'auto',
            zIndex: 10,
          }}
        >
          {video.caption}
        </div>
      )}
    </div>
  );
}

