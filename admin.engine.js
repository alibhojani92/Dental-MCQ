// admin.engine.js

import { sendMessage, buildAdminKeyboard } from './utils';
import { insertMCQ } from './db';
import { importCSV } from './csv.importer';

const ADMIN_IDS = [123456789]; // 🔴 replace with real Telegram admin IDs

function isAdmin(userId) {
  return ADMIN_IDS.includes(userId);
}

/* =====================
   ADMIN COMMAND
===================== */
export async function handleAdminCommand(env, message) {
  const chatId = message.chat.id;
  const userId = message.from.id;

  if (!isAdmin(userId)) {
    return sendMessage(env, chatId, '❌ You are not authorized.');
  }

  if (message.text === '/admin') {
    return sendMessage(
      env,
      chatId,
      `🧑‍💻 Admin Panel\n\nChoose an option 👇`,
      buildAdminKeyboard()
    );
  }
}

/* =====================
   ADMIN CALLBACK
===================== */
export async function handleAdminCallback(env, cb) {
  const chatId = cb.message.chat.id;
  const userId = cb.from.id;
  const data = cb.data;

  if (!isAdmin(userId)) {
    return sendMessage(env, chatId, '❌ Unauthorized action.');
  }

  if (data === 'ADMIN_ADD_MANUAL') {
    return sendMessage(
      env,
      chatId,
`✍️ Send MCQ in this format:

Question
A) option
B) option
C) option
D) option
Correct: A
Subject:
Topic:
Difficulty:
Explanation:`
    );
  }

  if (data === 'ADMIN_UPLOAD_CSV') {
    return sendMessage(
      env,
      chatId,
`📄 Upload CSV file now

Required columns:
question, option_a, option_b, option_c, option_d,
correct, subject, topic, difficulty, explanation`
    );
  }
}

/* =====================
   MANUAL MCQ ADD
===================== */
export async function handleAdminMessage(env, message) {
  const userId = message.from.id;
  const chatId = message.chat.id;

  if (!isAdmin(userId)) return;

  if (!message.text) return;

  // very basic parser (can be improved)
  if (message.text.includes('Correct:')) {
    const lines = message.text.split('\n');

    const mcq = {
      question: lines[0],
      option_a: lines[1]?.slice(3),
      option_b: lines[2]?.slice(3),
      option_c: lines[3]?.slice(3),
      option_d: lines[4]?.slice(3),
      correct: lines[5]?.split(':')[1]?.trim(),
      subject: lines[6]?.split(':')[1]?.trim(),
      topic: lines[7]?.split(':')[1]?.trim(),
      difficulty: lines[8]?.split(':')[1]?.trim(),
      explanation: lines[9]?.split(':')[1]?.trim(),
      hash: crypto.randomUUID()
    };

    await insertMCQ(env.DB, mcq);

    return sendMessage(env, chatId, '✅ MCQ added successfully');
  }
    }
