# Simple Vercel Setup Guide

## 🚀 Deploy to Vercel in 5 Steps

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ayahflow.git
git push -u origin main
```

### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Click **"Import"**

### Step 3: Add Environment Variables

In Vercel project settings, add these:

```
BOT_TOKEN = your_telegram_bot_token
CHANNEL_ID = your_channel_id
WEBHOOK_SECRET_TOKEN = random_secret_string_32_chars_min
PRISMA_DATABASE_URL = your_prisma_database_url (recommended)
```

**Note:** The app supports multiple database URL formats:
- `PRISMA_DATABASE_URL` (priority - recommended for free Postgres services)
- `POSTGRES_URL` (fallback)
- `DATABASE_URL` (fallback)

**How to add:**
- Go to **Settings** → **Environment Variables**
- Add each variable
- Select **Production**, **Preview**, and **Development**
- Click **Save**

### Step 4: Set Up Database

**Option A: Free PostgreSQL Services (Recommended)**
- Use **Neon**, **Supabase**, **Railway**, or any free PostgreSQL service
- Copy the Prisma-compatible connection string
- Add to `PRISMA_DATABASE_URL` environment variable

**Option B: Vercel Postgres**
1. In Vercel dashboard → **Storage** tab
2. Click **Create Database** → **Postgres**
3. Copy connection string to `PRISMA_DATABASE_URL` or `POSTGRES_URL`

**The app automatically detects and uses:**
1. `PRISMA_DATABASE_URL` (first priority)
2. `POSTGRES_URL` (fallback)
3. `DATABASE_URL` (fallback)

**Initialize Database:**
After deployment, visit:
```
https://your-app.vercel.app/api/init-db
```
Then delete `/app/api/init-db/route.ts` for security.

### Step 5: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (~2 minutes)
3. Copy your deployment URL: `https://your-app.vercel.app`

## 🔗 Configure Telegram

### Set Webhook

```bash
node scripts/setup-webhook.js \
  https://your-app.vercel.app/api/webhook/telegram \
  your_webhook_secret_token
```

Or use curl:
```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.vercel.app/api/webhook/telegram",
    "secret_token": "your_webhook_secret_token",
    "allowed_updates": ["channel_post", "message"]
  }'
```

### Set Bot Menu Button

Message [@BotFather](https://t.me/BotFather):
```
/setmenubutton
@your_bot_username
Open App
https://your-app.vercel.app
```

## ✅ Verify Everything Works

1. **Check webhook**: Visit `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. **Post a video** to your Telegram channel
3. **Check logs**: Vercel → **Functions** → View logs
4. **Open Mini App**: Telegram → Your Bot → Menu Button

## 🔧 Troubleshooting

**Build fails?**
- Check environment variables are set
- Verify `PRISMA_DATABASE_URL` or `POSTGRES_URL` is correct
- Check build logs in Vercel

**Webhook not working?**
- Verify URL is accessible (no 404)
- Check secret token matches
- Ensure bot is admin in channel

**Database error?**
- Visit `/api/init-db` to initialize schema
- Check connection string format
- Verify database is accessible

## 📝 Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Database created and connected
- [ ] Deployed successfully
- [ ] Database initialized (`/api/init-db`)
- [ ] Webhook configured
- [ ] Bot menu button set
- [ ] Tested with a video post

That's it! Your app should be live. 🎉

