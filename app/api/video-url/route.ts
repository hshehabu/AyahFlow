import { NextRequest, NextResponse } from 'next/server';
import { getTelegramFileUrl } from '@/lib/telegram';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get('file_id');
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'file_id parameter is required' },
        { status: 400 }
      );
    }
    
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      );
    }
    
    const fileUrl = await getTelegramFileUrl(fileId, botToken);
    
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Error getting video URL:', error);
    return NextResponse.json(
      { error: 'Failed to get video URL' },
      { status: 500 }
    );
  }
}

