# AyahFlow - Telegram Mini App for Scrolling Quran Videos

A TikTok-style vertical scrolling video feed for Quranic short videos, built as a Telegram Mini App.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Backend**: Next.js API Routes (Vercel-compatible)
- **Database**: PostgreSQL (Vercel Postgres / Neon / Supabase)
- **Telegram Integration**: Bot API + WebApp SDK
- **Deployment**: Vercel

## 📁 Project Structure

```
AyahFlow/
├── app/
│   ├── api/
│   │   ├── videos/route.ts          # GET /api/videos (pagination)
│   │   ├── video-url/route.ts       # GET /api/video-url (get Telegram file URL)
│   │   └── webhook/telegram/route.ts # POST /api/webhook/telegram
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Main Mini App page
│   └── globals.css                  # Global styles
├── components/
│   ├── VideoFeed.tsx                # Vertical scrolling feed
│   └── VideoPlayer.tsx              # Video player component
├── lib/
│   ├── db.ts                        # Database operations
│   ├── telegram.ts                  # Telegram API utilities
│   └── telegram-webapp.d.ts         # Telegram WebApp types
├── scripts/
│   ├── migrate.js                   # Database migration script
│   └── setup-webhook.js             # Webhook setup script
├── .env.example                     # Environment variables template
├── vercel.json                      # Vercel configuration
└── package.json                     # Dependencies
```

## 🚀 Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Telegram Channel ID (public channel)
- Vercel account (for deployment)
- PostgreSQL database (Vercel Postgres, Neon, or Supabase)

### 2. Create Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow instructions
3. Save your bot token
4. Send `/setmenubutton` to your bot:
   ```
   /setmenubutton
   @your_bot_name
   Open App
   https://your-vercel-app.vercel.app
   ```

### 3. Add Bot to Channel

1. Go to your Telegram channel
2. Add your bot as an administrator
3. Get your channel ID:
   - Forward a message from your channel to [@userinfobot](https://t.me/userinfobot)
   - Note the channel ID (usually negative number like `-1001234567890`)

### 4. Local Development Setup

```bash
# Clone and install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your values:
# - BOT_TOKEN=your_bot_token
# - CHANNEL_ID=your_channel_id
# - WEBHOOK_SECRET_TOKEN=random_secret_string
# - POSTGRES_URL=your_database_url
```

### 5. Database Setup

#### Option A: Vercel Postgres

1. Go to your Vercel project dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the connection strings to `.env`

#### Option B: Neon

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `.env` as `POSTGRES_URL`

#### Option C: Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string to `.env` as `POSTGRES_URL`

#### Run Migration

```bash
# Set POSTGRES_URL in .env first
node scripts/migrate.js
```

### 6. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` (Note: Telegram WebApp features only work in Telegram)

### 7. Deploy to Vercel

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add BOT_TOKEN
vercel env add CHANNEL_ID
vercel env add WEBHOOK_SECRET_TOKEN
vercel env add POSTGRES_URL
vercel env add POSTGRES_PRISMA_URL
vercel env add POSTGRES_URL_NON_POOLING

# Deploy production
vercel --prod
```

#### Option B: GitHub Integration

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables in Vercel dashboard:
   - `BOT_TOKEN`
   - `CHANNEL_ID`
   - `WEBHOOK_SECRET_TOKEN`
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
4. Deploy

### 8. Set Up Webhook

After deployment, configure the Telegram webhook:

```bash
# Replace with your Vercel URL and secret token
node scripts/setup-webhook.js \
  https://your-app.vercel.app/api/webhook/telegram \
  your_secret_token_from_env
```

Or manually via curl:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.vercel.app/api/webhook/telegram",
    "secret_token": "your_secret_token",
    "allowed_updates": ["channel_post", "message"]
  }'
```

### 9. Initialize Database on Vercel

After deployment, trigger the migration by calling the webhook endpoint or run:

```bash
# Set environment variables first
export POSTGRES_URL="your_vercel_postgres_url"
node scripts/migrate.js
```

Or create a one-time API route to initialize:

```typescript
// app/api/init-db/route.ts (temporary)
import { initDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  await initDatabase();
  return NextResponse.json({ ok: true });
}
```

Call `https://your-app.vercel.app/api/init-db` once, then delete the route.

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BOT_TOKEN` | Telegram bot token from BotFather | Yes |
| `CHANNEL_ID` | Telegram channel ID (numeric) | Yes |
| `WEBHOOK_SECRET_TOKEN` | Secret token for webhook validation | Yes |
| `POSTGRES_URL` | PostgreSQL connection string | Yes |
| `POSTGRES_PRISMA_URL` | Prisma-compatible connection string | Yes (Vercel Postgres) |
| `POSTGRES_URL_NON_POOLING` | Non-pooling connection string | Yes (Vercel Postgres) |

## 📡 API Endpoints

### `GET /api/videos`

Fetch videos with cursor-based pagination.

**Query Parameters:**
- `cursor` (optional): Last video ID for pagination
- `limit` (optional): Number of videos per page (default: 20, max: 50)

**Response:**
```json
{
  "videos": [
    {
      "id": 1,
      "file_id": "BAACAgIAAxkBAAIB...",
      "caption": "Video caption",
      "message_id": 12345,
      "posted_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "next_cursor": 10,
  "has_more": true
}
```

### `POST /api/webhook/telegram`

Telegram webhook endpoint for receiving channel posts.

**Headers:**
- `X-Telegram-Bot-Api-Secret-Token`: Webhook secret token

**Body:** Telegram Update object

### `GET /api/video-url`

Get Telegram CDN URL for a video file.

**Query Parameters:**
- `file_id`: Telegram file_id

**Response:**
```json
{
  "url": "https://api.telegram.org/file/bot<token>/videos/file_123.mp4"
}
```

## 🎨 Features

- ✅ Vertical scrolling TikTok-style feed
- ✅ Auto-play videos when visible
- ✅ Auto-pause when out of view
- ✅ Smooth scroll snapping
- ✅ Mute/unmute toggle
- ✅ Caption overlay
- ✅ Telegram theme support (dark/light)
- ✅ Infinite scroll pagination
- ✅ Webhook-based video ingestion
- ✅ No video downloads (streams from Telegram CDN)

## 🔒 Security

- Webhook signature validation
- Duplicate message prevention (unique constraint on `message_id`)
- Environment variable protection
- SQL injection prevention (parameterized queries)

## 🐛 Troubleshooting

### Videos not appearing

1. Check webhook is set correctly: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. Verify bot is admin in channel
3. Check database has videos: Query `SELECT * FROM videos LIMIT 10;`
4. Check Vercel function logs

### Webhook not receiving updates

1. Verify webhook URL is accessible
2. Check `WEBHOOK_SECRET_TOKEN` matches
3. Ensure bot is admin in channel
4. Check Telegram API status

### Database connection errors

1. Verify `POSTGRES_URL` is correct
2. Check database is accessible from Vercel
3. Ensure IP allowlist includes Vercel IPs (if applicable)

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

