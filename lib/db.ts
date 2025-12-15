import { sql } from '@vercel/postgres';

export interface Video {
  id: number;
  file_id: string;
  caption: string | null;
  message_id: number;
  posted_at: Date;
}

export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        file_id TEXT NOT NULL,
        caption TEXT,
        message_id BIGINT UNIQUE NOT NULL,
        posted_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_videos_posted_at ON videos(posted_at DESC);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_videos_message_id ON videos(message_id);
    `;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export async function insertVideo(
  fileId: string,
  messageId: number,
  caption: string | null,
  postedAt: Date
): Promise<Video> {
  try {
    const result = await sql`
      INSERT INTO videos (file_id, message_id, caption, posted_at)
      VALUES (${fileId}, ${messageId}, ${caption}, ${postedAt})
      ON CONFLICT (message_id) DO NOTHING
      RETURNING *
    `;
    
    if (result.rows.length === 0) {
      // Video already exists, fetch it
      const existing = await sql`
        SELECT * FROM videos WHERE message_id = ${messageId}
      `;
      return existing.rows[0] as Video;
    }
    
    return result.rows[0] as Video;
  } catch (error) {
    console.error('Error inserting video:', error);
    throw error;
  }
}

export async function getVideos(
  cursor: number | null,
  limit: number = 20
): Promise<{ videos: Video[]; nextCursor: number | null }> {
  try {
    let query;
    
    if (cursor) {
      query = sql`
        SELECT * FROM videos
        WHERE id < ${cursor}
        ORDER BY posted_at DESC
        LIMIT ${limit + 1}
      `;
    } else {
      query = sql`
        SELECT * FROM videos
        ORDER BY posted_at DESC
        LIMIT ${limit + 1}
      `;
    }
    
    const result = await query;
    const videos = result.rows as Video[];
    
    let nextCursor: number | null = null;
    if (videos.length > limit) {
      nextCursor = videos[limit - 1].id;
      videos.pop();
    }
    
    return { videos, nextCursor };
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}

