'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import VideoPlayer from './VideoPlayer';

interface Video {
  id: number;
  file_id: string;
  caption: string | null;
  message_id: number;
  posted_at: string;
}

export default function VideoFeed() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadVideos = useCallback(async (cursor: number | null = null) => {
    try {
      const params = new URLSearchParams();
      if (cursor) params.set('cursor', cursor.toString());
      params.set('limit', '10');

      const response = await fetch(`/api/videos?${params}`);
      if (!response.ok) throw new Error('Failed to fetch videos');

      const data = await response.json();
      
      if (cursor) {
        setVideos(prev => [...prev, ...data.videos]);
      } else {
        setVideos(data.videos);
      }
      
      setNextCursor(data.next_cursor);
      setHasMore(data.has_more);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Intersection Observer for auto-play/pause
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = parseInt(entry.target.getAttribute('data-video-id') || '0');
          
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setActiveVideoId(videoId);
          }
        });
      },
      {
        threshold: [0, 0.5, 1],
        rootMargin: '0px',
      }
    );

    const videoElements = containerRef.current.querySelectorAll('[data-video-id]');
    videoElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [videos]);

  // Load more when scrolling near bottom
  useEffect(() => {
    if (!hasMore || loading) return;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < 500 && nextCursor) {
        loadVideos(nextCursor);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loading, nextCursor, loadVideos]);

  const getTheme = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      return window.Telegram.WebApp.colorScheme || 'dark';
    }
    return 'dark';
  };

  const theme = getTheme();
  const bgColor = theme === 'dark' ? '#000000' : '#ffffff';

  if (loading && videos.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: bgColor,
          color: theme === 'dark' ? '#fff' : '#000',
        }}
      >
        Loading videos...
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: bgColor,
          color: theme === 'dark' ? '#fff' : '#000',
        }}
      >
        No videos available
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: '100vh',
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth',
        backgroundColor: bgColor,
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {videos.map((video) => (
        <div
          key={video.id}
          data-video-id={video.id}
          style={{
            height: '100vh',
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <VideoPlayer
            video={video}
            isActive={activeVideoId === video.id}
          />
        </div>
      ))}
      {loading && videos.length > 0 && (
        <div
          style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: theme === 'dark' ? '#fff' : '#000',
          }}
        >
          Loading more...
        </div>
      )}
    </div>
  );
}

