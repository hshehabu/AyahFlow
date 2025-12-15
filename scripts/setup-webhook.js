/**
 * Script to set up Telegram webhook
 * Run this after deploying to Vercel to configure the webhook URL
 * 
 * Usage: node scripts/setup-webhook.js <webhook_url> <secret_token>
 */

const https = require('https');

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.argv[2];
const SECRET_TOKEN = process.argv[3];

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN environment variable is required');
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.error('❌ Webhook URL is required');
  console.log('Usage: node scripts/setup-webhook.js <webhook_url> [secret_token]');
  process.exit(1);
}

const webhookPath = `/bot${BOT_TOKEN}/setWebhook`;
const postData = JSON.stringify({
  url: WEBHOOK_URL,
  secret_token: SECRET_TOKEN || undefined,
  allowed_updates: ['channel_post', 'message'],
});

const options = {
  hostname: 'api.telegram.org',
  port: 443,
  path: webhookPath,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.ok) {
        console.log('✅ Webhook set successfully!');
        console.log('Webhook URL:', WEBHOOK_URL);
        if (SECRET_TOKEN) {
          console.log('Secret token configured');
        }
      } else {
        console.error('❌ Failed to set webhook:', response.description);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error);
      console.log('Response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
  process.exit(1);
});

req.write(postData);
req.end();

