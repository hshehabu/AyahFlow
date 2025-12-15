import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramWebhook, isVideoMessage, getVideoFileId, TelegramUpdate } from '@/lib/telegram';
import { insertVideo, initDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Validate webhook secret token
    const secretToken = process.env.WEBHOOK_SECRET_TOKEN;
    const receivedToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    
    if (secretToken && receivedToken) {
      if (!validateTelegramWebhook(secretToken, receivedToken)) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    const update: TelegramUpdate = await request.json();
    
    // Initialize database if needed
    await initDatabase();
    
    // Check if this is a channel post
    const message = update.channel_post || update.message;
    
    if (!message) {
      return NextResponse.json({ ok: true, message: 'No message found' });
    }
    
    // Check if message is from the target channel
    const channelId = process.env.CHANNEL_ID;
    if (channelId && message.chat.id.toString() !== channelId) {
      return NextResponse.json({ ok: true, message: 'Not from target channel' });
    }
    
    // Process only video messages
    if (!isVideoMessage(message)) {
      return NextResponse.json({ ok: true, message: 'Not a video message' });
    }
    
    const fileId = getVideoFileId(message);
    if (!fileId) {
      return NextResponse.json({ ok: true, message: 'No video file_id found' });
    }
    
    // Insert video into database
    const postedAt = new Date(message.date * 1000);
    await insertVideo(
      fileId,
      message.message_id,
      message.caption || null,
      postedAt
    );
    
    return NextResponse.json({ ok: true, message: 'Video processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'telegram-webhook' });
}

