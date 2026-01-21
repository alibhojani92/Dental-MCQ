// mcq.engine.js

import { fetchMCQForUser, saveMCQAttempt } from './db';

/* =====================
   GET MCQ SET (30-DAY RULE)
===================== */
export async function getMCQSet(env, userId, count) {
  const result = await fetchMCQForUser(env.DB, userId, count);

  if (!result.results || result.results.length < count) {
    return {
      ok: false,
      message: 'Not enough MCQs available. Please try later.'
    };
  }

  return {
    ok: true,
    mcqs: result.results
  };
}

/* =====================
   FORMAT QUESTION
===================== */
export function formatMCQ(mcq, index, total) {
  return {
    text:
`Question ${index} / ${total}

${mcq.question}

A) ${mcq.option_a}
B) ${mcq.option_b}
C) ${mcq.option_c}
D) ${mcq.option_d}`,
    options: ['A', 'B', 'C', 'D'],
    correct: mcq.correct,
    mcqId: mcq.id,
    explanation: mcq.explanation || ''
  };
}

/* =====================
   SAVE ATTEMPT (FOR 30-DAY RULE)
===================== */
export async function registerAttempt(env, userId, mcqId) {
  await saveMCQAttempt(env.DB, userId, mcqId);
}
