# Deployment Guide - AyahFlow

## Quick Deployment Checklist

### 1. Pre-Deployment Setup

- [ ] Create Telegram bot via [@BotFather](https://t.me/BotFather)
- [ ] Get bot token
- [ ] Create or identify Telegram channel
- [ ] Add bot as admin to channel
- [ ] Get channel ID (forward message to [@userinfobot](https://t.me/userinfobot))

### 2. Database Setup

The app supports multiple database URL formats (checked in priority order):
1. `PRISMA_DATABASE_URL` (recommended for free Postgres services)
2. `POSTGRES_URL` (fallback)
3. `DATABASE_URL` (fallback)

Choose one:

#### Option A: Free PostgreSQL Services (Recommended)

**Neon, Supabase, Railway, or any free PostgreSQL:**
1. Sign up and create a new project
2. Copy the Prisma-compatible connection string
3. Add to environment variables as `PRISMA_DATABASE_URL`

#### Option B: Vercel Postgres
1. In Vercel dashboard → Storage → Create Database → Postgres
2. Copy connection string to `PRISMA_DATABASE_URL` or `POSTGRES_URL`

### 3. Deploy to Vercel

#### Via GitHub (Recommended)

1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add Environment Variables:
   ```
   BOT_TOKEN=your_bot_token
   CHANNEL_ID=your_channel_id
   WEBHOOK_SECRET_TOKEN=random_secret_string_min_32_chars
   PRISMA_DATABASE_URL=your_prisma_database_url (recommended)
   ```
   
   **Note:** You can also use `POSTGRES_URL` or `DATABASE_URL` as alternatives.
6. Deploy

#### Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel

# Add environment variables
vercel env add BOT_TOKEN
vercel env add CHANNEL_ID
vercel env add WEBHOOK_SECRET_TOKEN
vercel env add POSTGRES_URL
# ... add others

vercel --prod
```

### 4. Initialize Database

After deployment, initialize the database schema:

**Option A: Via API endpoint (one-time)**
```
GET https://your-app.vercel.app/api/init-db
```

**Option B: Via script**
```bash
export POSTGRES_URL="your_postgres_url"
node scripts/migrate.js
```

**⚠️ Important:** Delete `/app/api/init-db/route.ts` after initialization for security.

### 5. Configure Telegram Webhook

Replace placeholders with your values:

```bash
node scripts/setup-webhook.js \
  https://your-app.vercel.app/api/webhook/telegram \
  your_webhook_secret_token
```

Or manually:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.vercel.app/api/webhook/telegram",
    "secret_token": "your_webhook_secret_token",
    "allowed_updates": ["channel_post", "message"]
  }'
```

Verify webhook:
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### 6. Configure Bot Menu Button

Send to [@BotFather](https://t.me/BotFather):

```
/setmenubutton
@your_bot_username
Open App
https://your-app.vercel.app
```

### 7. Test

1. Post a video to your Telegram channel
2. Check webhook received it: Vercel → Functions → Logs
3. Verify database: Query `SELECT COUNT(*) FROM videos;`
4. Open Mini App in Telegram: Bot → Menu Button
5. Scroll through videos

## Troubleshooting

### Webhook Not Receiving Updates

1. Check webhook info:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   ```

2. Verify:
   - Bot is admin in channel
   - Webhook URL is accessible (no 404/500)
   - Secret token matches
   - Channel ID matches

3. Check Vercel function logs for errors

### Database Connection Issues

1. Verify environment variables are set correctly
2. Check database is accessible (not paused/stopped)
3. For Vercel Postgres: Ensure all 3 connection strings are set
4. Check Vercel function logs for connection errors

### Videos Not Appearing

1. Check database has videos:
   ```sql
   SELECT * FROM videos ORDER BY posted_at DESC LIMIT 10;
   ```

2. Verify API endpoint works:
   ```bash
   curl "https://your-app.vercel.app/api/videos"
   ```

3. Check browser console for errors
4. Verify Telegram WebApp SDK loaded (check Network tab)

## Post-Deployment Security

1. Delete `/app/api/init-db/route.ts` after initialization
2. Rotate `WEBHOOK_SECRET_TOKEN` periodically
3. Monitor Vercel function logs for suspicious activity
4. Set up Vercel monitoring/alerts

## Environment Variables Reference

| Variable | Example | Notes | Priority |
|----------|---------|-------|----------|
| `BOT_TOKEN` | `123456:ABC-DEF...` | From BotFather | Required |
| `CHANNEL_ID` | `-1001234567890` | Negative number for channels | Required |
| `WEBHOOK_SECRET_TOKEN` | `random_string_32_chars_min` | Generate securely | Required |
| `PRISMA_DATABASE_URL` | `postgres://...` | Prisma-compatible connection string | 1st (recommended) |
| `POSTGRES_URL` | `postgres://...` | Standard PostgreSQL connection string | 2nd (fallback) |
| `DATABASE_URL` | `postgres://...` | Generic database connection string | 3rd (fallback) |

**Note:** At least one database URL must be provided (checked in priority order above).

## Monitoring

- **Vercel Dashboard**: Function logs, analytics
- **Database**: Query performance, connection pool
- **Telegram**: Bot API usage, webhook status

