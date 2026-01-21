// test.engine.js

import { getMCQSet, formatMCQ, registerAttempt } from './mcq.engine';
import { createTestSession, finishTestSession } from './db';
import { sendMessage, editMessage, buildOptionsKeyboard } from './utils';

const ACTIVE_SESSIONS = new Map();

/* =====================
   COMMAND HANDLER
===================== */
export async function handleTestCommand(env, message) {
  const chatId = message.chat.id;

  if (message.text === '/daily') {
    return startTest(env, chatId, message.from.id, 'DAILY', 20);
  }

  if (message.text === '/weekly') {
    return startTest(env, chatId, message.from.id, 'WEEKLY', 50);
  }
}

/* =====================
   CALLBACK HANDLER
===================== */
export async function handleTestCallback(env, cb) {
  const userId = cb.from.id;
  const data = cb.data;
  const session = ACTIVE_SESSIONS.get(userId);

  if (!session) {
    return sendMessage(env, cb.message.chat.id,
      '⚠️ This session has expired.\nPlease start a new test.');
  }

  // answer selected
  if (['A', 'B', 'C', 'D'].includes(data)) {
    return processAnswer(env, cb, session, data);
  }

  // start buttons
  if (data === 'DAILY') {
    return startTest(env, cb.message.chat.id, userId, 'DAILY', 20);
  }

  if (data === 'WEEKLY') {
    return startTest(env, cb.message.chat.id, userId, 'WEEKLY', 50);
  }
}

/* =====================
   START TEST
===================== */
async function startTest(env, chatId, userId, type, total) {
  const mcqSet = await getMCQSet(env, userId, total);

  if (!mcqSet.ok) {
    return sendMessage(env, chatId, mcqSet.message);
  }

  const sessionDb = await createTestSession(env.DB, {
    user_id: userId,
    test_type: type,
    total
  });

  const session = {
    sessionId: sessionDb.meta.last_row_id,
    chatId,
    userId,
    type,
    index: 0,
    score: 0,
    mcqs: mcqSet.mcqs
  };

  ACTIVE_SESSIONS.set(userId, session);

  return sendNextQuestion(env, session);
}

/* =====================
   SEND QUESTION
===================== */
async function sendNextQuestion(env, session) {
  const mcq = session.mcqs[session.index];
  const q = formatMCQ(mcq, session.index + 1, session.mcqs.length);

  await sendMessage(
    env,
    session.chatId,
    q.text,
    buildOptionsKeyboard(q.options)
  );
}

/* =====================
   PROCESS ANSWER
===================== */
async function processAnswer(env, cb, session, answer) {
  const mcq = session.mcqs[session.index];

  await registerAttempt(env, session.userId, mcq.id);

  let reply = '';
  if (answer === mcq.correct) {
    session.score++;
    reply = '✅ Correct!';
  } else {
    reply =
`❌ Wrong

✅ Correct: ${mcq.correct}

${mcq.explanation || ''}`;
  }

  session.index++;

  if (session.index >= session.mcqs.length) {
    ACTIVE_SESSIONS.delete(session.userId);
    await finishTestSession(env.DB, session.sessionId, session.score);

    return sendMessage(
      env,
      session.chatId,
`🎉 Test Completed!

Score: ${session.score} / ${session.mcqs.length}`
    );
  }

  await editMessage(env, cb.message.chat.id, cb.message.message_id, reply);
  return sendNextQuestion(env, session);
                     }
