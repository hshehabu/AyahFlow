# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Edit `.env`:
- `BOT_TOKEN`: Get from [@BotFather](https://t.me/BotFather)
- `CHANNEL_ID`: Your Telegram channel ID (negative number)
- `WEBHOOK_SECRET_TOKEN`: Random secure string (min 32 chars)
- `POSTGRES_URL`: Your PostgreSQL connection string

### Step 3: Initialize Database

```bash
npm run db:migrate
```

Or manually:
```bash
node scripts/migrate.js
```

### Step 4: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

**Note**: Full Telegram WebApp features only work when opened from Telegram.

### Step 5: Set Up Webhook (After Deployment)

```bash
node scripts/setup-webhook.js \
  https://your-app.vercel.app/api/webhook/telegram \
  your_webhook_secret_token
```

## 📝 Next Steps

1. **Deploy to Vercel**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Configure Bot Menu**: Use BotFather to set menu button URL
3. **Test**: Post a video to your channel and verify it appears in the app

## 🔍 Verify Setup

1. Check database: Videos should appear after channel posts
2. Check API: `curl http://localhost:3000/api/videos`
3. Check webhook: Post a video to channel, check logs

## ❓ Common Issues

**Database connection error?**
- Verify `POSTGRES_URL` is correct
- Check database is running/accessible

**Webhook not working?**
- Verify bot is admin in channel
- Check webhook URL is accessible
- Verify secret token matches

**Videos not appearing?**
- Check database has videos: `SELECT * FROM videos;`
- Verify API endpoint returns data
- Check browser console for errors

For detailed troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md).

