'use client';

import { useEffect, useState } from 'react';
import VideoFeed from '@/components/VideoFeed';
import { TelegramWebApp } from '@/lib/telegram-webapp';

export default function Home() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      tg.ready();
      tg.expand();
      
      // Set theme colors
      tg.setHeaderColor(tg.themeParams.bg_color || '#000000');
      tg.setBackgroundColor(tg.themeParams.bg_color || '#000000');
      
      setIsReady(true);
    } else {
      // Fallback for development
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff'
      }}>
        Loading...
      </div>
    );
  }

  return <VideoFeed />;
}

