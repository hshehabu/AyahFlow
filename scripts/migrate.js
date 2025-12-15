const { Pool } = require('pg');

// Get database connection string from environment variables
function getDatabaseUrl() {
  // Priority: PRISMA_DATABASE_URL > POSTGRES_URL > DATABASE_URL
  const url = 
    process.env.PRISMA_DATABASE_URL || 
    process.env.POSTGRES_URL || 
    process.env.DATABASE_URL;
  
  if (!url) {
    console.error('❌ Database URL not found!');
    console.error('Please set one of these environment variables:');
    console.error('  - PRISMA_DATABASE_URL');
    console.error('  - POSTGRES_URL');
    console.error('  - DATABASE_URL');
    process.exit(1);
  }
  
  return url;
}

async function migrate() {
  const connectionString = getDatabaseUrl();
  
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('sslmode=require') || connectionString.includes('ssl=true') 
      ? { rejectUnauthorized: false } 
      : undefined,
  });

  try {
    console.log('🔄 Running database migrations...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        file_id TEXT NOT NULL,
        caption TEXT,
        message_id BIGINT UNIQUE NOT NULL,
        posted_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_videos_posted_at ON videos(posted_at DESC);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_videos_message_id ON videos(message_id);
    `);
    
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
