// utils.js

const TELEGRAM_API = 'https://api.telegram.org/bot';

/* =====================
   SEND MESSAGE
===================== */
export async function sendMessage(env, chatId, text, replyMarkup = null) {
  const body = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    reply_markup: replyMarkup
  };

  await fetch(`${TELEGRAM_API}${env.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

/* =====================
   EDIT MESSAGE
===================== */
export async function editMessage(env, chatId, messageId, text) {
  await fetch(`${TELEGRAM_API}${env.BOT_TOKEN}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'Markdown'
    })
  });
}

/* =====================
   ANSWER CALLBACK
===================== */
export async function answerCallback(env, callbackId) {
  await fetch(`${TELEGRAM_API}${env.BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackId })
  });
}

/* =====================
   KEYBOARDS
===================== */
export function buildOptionsKeyboard(options) {
  return {
    inline_keyboard: options.map(o => [{ text: o, callback_data: o }])
  };
}

export function buildAdminKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '➕ Add MCQ (Manual)', callback_data: 'ADMIN_ADD_MANUAL' }],
      [{ text: '📄 Upload CSV', callback_data: 'ADMIN_UPLOAD_CSV' }]
    ]
  };
}

/* =====================
   HASH GENERATOR
===================== */
export function generateHash(text) {
  return crypto.subtle
    .digest('SHA-256', new TextEncoder().encode(text))
    .then(buf =>
      Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    );
}
