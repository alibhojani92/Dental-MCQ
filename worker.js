export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('OK');
    }

    const update = await request.json();

    // ✅ MESSAGE TEST
    if (update.message) {
      const chatId = update.message.chat.id;

      await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: 'MESSAGE RECEIVED ✅'
        })
      });

      return new Response('ok');
    }

    // ✅ CALLBACK TEST (MOST IMPORTANT)
    if (update.callback_query) {
      const cb = update.callback_query;

      await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cb.message.chat.id,
          text: `CALLBACK RECEIVED ✅ : ${cb.data}`
        })
      });

      return new Response('ok');
    }

    return new Response('ok');
  }
};
