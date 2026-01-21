import { handleTestCommand, handleTestCallback } from './test.engine';
import { handleAdminCommand, handleAdminCallback } from './admin.engine';
import { getOrCreateUser } from './db';
import { sendMessage, answerCallback } from './utils';

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('OK');
    }

    const update = await request.json();

    try {
      /* =====================
         MESSAGE HANDLER
      ====================== */
      if (update.message) {
        const message = update.message;
        const chatId = message.chat.id;
        const userId = message.from.id;
        const text = message.text || '';

        // save / get user
        await getOrCreateUser(env.DB, message.from);

        // /start
        if (text === '/start') {
          await sendMessage(env, chatId,
`👋 Welcome to Smart MCQ Test Bot

Choose an option 👇`,
          {
            inline_keyboard: [
              [{ text: '📝 Daily Test', callback_data: 'DAILY' }],
              [{ text: '📅 Weekly Test', callback_data: 'WEEKLY' }],
              [{ text: '📊 My Progress', callback_data: 'PROGRESS' }]
            ]
          });
          return new Response('ok');
        }

        // admin commands
        if (text.startsWith('/admin')) {
          return await handleAdminCommand(env, message);
        }

        // test related commands
        return await handleTestCommand(env, message);
      }

      /* =====================
         CALLBACK HANDLER
      ====================== */
      if (update.callback_query) {
        const cb = update.callback_query;
        const data = cb.data;
        const chatId = cb.message.chat.id;

        // acknowledge callback
        await answerCallback(env, cb.id);

        // admin callbacks
        if (data.startsWith('ADMIN_')) {
          return await handleAdminCallback(env, cb);
        }

        // test callbacks
        return await handleTestCallback(env, cb);
      }

      return new Response('ok');
    } catch (err) {
      console.error('Worker error:', err);
      return new Response('error', { status: 500 });
    }
  }
};
