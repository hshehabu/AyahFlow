import { timingSafeEqual } from 'crypto';

export interface TelegramUpdate {
  update_id: number;
  channel_post?: TelegramMessage;
  message?: TelegramMessage;
}

export interface TelegramMessage {
  message_id: number;
  date: number;
  chat: {
    id: number;
    type: string;
    title?: string;
  };
  caption?: string;
  video?: TelegramVideo;
  document?: TelegramDocument;
}

export interface TelegramVideo {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface TelegramDocument {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export function validateTelegramWebhook(
  secretToken: string,
  receivedToken: string
): boolean {
  if (!secretToken || !receivedToken) {
    return false;
  }
  if (secretToken.length !== receivedToken.length) {
    return false;
  }
  try {
    return timingSafeEqual(
      Buffer.from(secretToken),
      Buffer.from(receivedToken)
    );
  } catch {
    return false;
  }
}

export function isVideoMessage(message: TelegramMessage): boolean {
  return !!(message.video || (message.document && message.document.mime_type?.startsWith('video/')));
}

export function getVideoFileId(message: TelegramMessage): string | null {
  if (message.video) {
    return message.video.file_id;
  }
  if (message.document && message.document.mime_type?.startsWith('video/')) {
    return message.document.file_id;
  }
  return null;
}

export async function getTelegramFileUrl(fileId: string, botToken: string): Promise<string> {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
  );
  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Failed to get file: ${data.description}`);
  }
  
  const filePath = data.result.file_path;
  return `https://api.telegram.org/file/bot${botToken}/${filePath}`;
}

