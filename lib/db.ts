import { Pool, QueryResult } from 'pg';

export interface Video {
  id: number;
  file_id: string;
  caption: string | null;
  message_id: number;
  posted_at: Date;
}

// Get database connection string from environment variables
function getDatabaseUrl(): string {
  // Priority: PRISMA_DATABASE_URL > POSTGRES_URL > DATABASE_URL
  const url = 
    process.env.PRISMA_DATABASE_URL || 
    process.env.POSTGRES_URL || 
    process.env.DATABASE_URL;
  
  if (!url) {
    throw new Error(
      'Database URL not found. Please set PRISMA_DATABASE_URL, POSTGRES_URL, or DATABASE_URL environment variable.'
    );
  }
  
  return url;
}

// Create a connection pool
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = getDatabaseUrl();
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') || connectionString.includes('ssl=true') 
        ? { rejectUnauthorized: false } 
        : undefined,
    });
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });
  }
  
  return pool;
}

// SQL template tag for querying
export async function sql(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<QueryResult> {
  const pool = getPool();
  const query = strings.reduce((acc, str, i) => {
    return acc + str + (i < values.length ? `$${i + 1}` : '');
  }, '');
  
  return pool.query(query, values);
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
    let result: QueryResult;
    
    if (cursor) {
      result = await sql`
        SELECT * FROM videos
        WHERE id < ${cursor}
        ORDER BY posted_at DESC
        LIMIT ${limit + 1}
      `;
    } else {
      result = await sql`
        SELECT * FROM videos
        ORDER BY posted_at DESC
        LIMIT ${limit + 1}
      `;
    }
    
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

// Close database connections (useful for cleanup)
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
