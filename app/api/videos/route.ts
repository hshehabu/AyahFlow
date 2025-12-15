import { NextRequest, NextResponse } from 'next/server';
import { getVideos, initDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Initialize database if needed
    await initDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const cursorParam = searchParams.get('cursor');
    const limitParam = searchParams.get('limit');
    
    const cursor = cursorParam ? parseInt(cursorParam, 10) : null;
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 50) : 20;
    
    if (cursor !== null && isNaN(cursor)) {
      return NextResponse.json(
        { error: 'Invalid cursor parameter' },
        { status: 400 }
      );
    }
    
    const { videos, nextCursor } = await getVideos(cursor, limit);
    
    return NextResponse.json({
      videos: videos.map(video => ({
        id: video.id,
        file_id: video.file_id,
        caption: video.caption,
        message_id: video.message_id,
        posted_at: video.posted_at.toISOString(),
      })),
      next_cursor: nextCursor,
      has_more: nextCursor !== null,
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

