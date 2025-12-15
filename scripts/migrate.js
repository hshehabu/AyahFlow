const { sql } = require('@vercel/postgres');

async function migrate() {
  try {
    console.log('Running database migrations...');
    
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
    
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();

