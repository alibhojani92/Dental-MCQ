// worker.js – FINAL FIXED VERSION (INLINE BUTTONS ONLY)

import { handleTestCommand, handleTestCallback } from './test.engine';
import { handleAdminCommand, handleAdminCallback } from './admin.engine';
import { getOrCreateUser } from './db';
import { sendMessage, answerCallback } from './utils';

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('OK');
    }

    let update;
    try {
      update = await request.json();
    } catch (e) {
      return new Response('Bad Request', { status: 400 });
    }

    try {
      /* =========================
         CALLBACK HANDLER (INLINE BUTTONS)
      ========================== */
      if (update.callback_query) {
        const cb = update.callback_query;
        const data = cb.data;

        // Telegram must be acknowledged
        await answerCallback(env, cb.id);

        // Admin callbacks
        if (data.startsWith('ADMIN_')) {
          await handleAdminCallback(env, cb);
          return new Response('ok');
        }

        // Test callbacks (DAILY / WEEKLY / PROGRESS / OPTIONS)
        await handleTestCallback(env, cb);
        return new Response('ok');
      }

      /* =========================
         MESSAGE HANDLER
      ========================== */
      if (update.message) {
        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text || '';

        // Save / get user
        await getOrCreateUser(env.DB, message.from);

        // /start command
        if (text === '/start') {
        if (text === '/start') {

  // 1️⃣ FIRST: remove old reply keyboard
  await sendMessage(env, chatId, 'Keyboard reset ✅', {
    remove_keyboard: true
  });

  // 2️⃣ SECOND: send inline keyboard
  await sendMessage(
    env,
    chatId,
`👋 Welcome to Smart MCQ Test Bot

Choose an option 👇`,
    {
      inline_keyboard: [
        [{ text: '📝 Daily Test', callback_data: 'DAILY' }],
        [{ text: '📅 Weekly Test', callback_data: 'WEEKLY' }],
        [{ text: '📊 My Progress', callback_data: 'PROGRESS' }]
      ]
    }
  );

  return new Response('ok');
        }

        // Admin commands
        if (text.startsWith('/admin')) {
          await handleAdminCommand(env, message);
          return new Response('ok');
        }

        // Any other text commands (/daily, /weekly if you support)
        await handleTestCommand(env, message);
        return new Response('ok');
      }

      return new Response('ok')
        
      console.error('Worker error:', err);
      return new Response('error', { status: 500 });
    }
  }
};
