# Project Structure

```
AyahFlow/
├── app/                              # Next.js App Router
│   ├── api/
│   │   ├── videos/
│   │   │   └── route.ts             # GET /api/videos (pagination)
│   │   ├── video-url/
│   │   │   └── route.ts             # GET /api/video-url (get Telegram file URL)
│   │   ├── webhook/
│   │   │   └── telegram/
│   │   │       └── route.ts         # POST /api/webhook/telegram
│   │   └── init-db/
│   │       └── route.ts             # GET /api/init-db (one-time DB setup)
│   ├── layout.tsx                   # Root layout with Telegram WebApp script
│   ├── page.tsx                     # Main Mini App page
│   └── globals.css                  # Global styles
│
├── components/
│   ├── VideoFeed.tsx                # Vertical scrolling feed component
│   └── VideoPlayer.tsx              # Video player with mute/unmute
│
├── lib/
│   ├── db.ts                        # Database operations (Vercel Postgres)
│   ├── telegram.ts                  # Telegram API utilities
│   └── telegram-webapp.d.ts         # TypeScript types for Telegram WebApp SDK
│
├── scripts/
│   ├── migrate.js                   # Database migration script
│   └── setup-webhook.js             # Telegram webhook setup script
│
├── .env.example                     # Environment variables template
├── .eslintrc.json                   # ESLint configuration
├── .gitignore                       # Git ignore rules
├── DEPLOYMENT.md                    # Detailed deployment guide
├── next.config.js                   # Next.js configuration
├── package.json                     # Dependencies and scripts
├── PROJECT_STRUCTURE.md             # This file
├── README.md                        # Main documentation
└── tsconfig.json                    # TypeScript configuration
```

## Key Files Explained

### Backend (API Routes)

- **`app/api/webhook/telegram/route.ts`**: Receives Telegram channel posts, extracts video metadata, stores in database
- **`app/api/videos/route.ts`**: Returns paginated list of videos (cursor-based)
- **`app/api/video-url/route.ts`**: Fetches Telegram CDN URL for a video file_id
- **`app/api/init-db/route.ts`**: One-time database initialization (delete after use)

### Frontend (React Components)

- **`app/page.tsx`**: Main entry point, initializes Telegram WebApp
- **`components/VideoFeed.tsx`**: Vertical scrolling container with IntersectionObserver
- **`components/VideoPlayer.tsx`**: Individual video player with auto-play/pause

### Database & Utilities

- **`lib/db.ts`**: Database schema, migrations, CRUD operations
- **`lib/telegram.ts`**: Telegram API helpers, webhook validation, file URL fetching
- **`lib/telegram-webapp.d.ts`**: TypeScript definitions for Telegram WebApp SDK

### Scripts

- **`scripts/migrate.js`**: Creates database tables and indexes
- **`scripts/setup-webhook.js`**: Configures Telegram webhook URL

## Data Flow

1. **Video Ingestion**:
   - Channel post → Telegram → Webhook → Extract video → Store in DB

2. **Video Display**:
   - User opens Mini App → Fetch videos from API → Display in feed → Auto-play visible videos

3. **Video Playback**:
   - User scrolls → IntersectionObserver detects visibility → Play/pause accordingly
   - Videos stream directly from Telegram CDN (no downloads)

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via @vercel/postgres)
- **Telegram**: Bot API + WebApp SDK
- **Deployment**: Vercel
- **Styling**: CSS-in-JS (inline styles for Mini App compatibility)

