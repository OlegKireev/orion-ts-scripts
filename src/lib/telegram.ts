export function sendTelegramMessage(text: string): void {
  const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '';
  const TG_CHAT_ID = process.env.TG_CHAT_ID || '';
  const TG_THREAD_ID = process.env.TG_THREAD_ID || '';

  const messageText = encodeURIComponent(text);
  const params = `chat_id=${TG_CHAT_ID}&message_thread_id=${TG_THREAD_ID}&text=${messageText}`;
  const url = `https://api.telegram.org/${TG_BOT_TOKEN}/sendMessage`;

  Orion.HttpPost(url, params);
}
