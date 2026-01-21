// db.js

/* =====================
   USER
===================== */
export async function getOrCreateUser(db, tgUser) {
  const { id, first_name, username } = tgUser;

  const existing = await db
    .prepare(`SELECT id FROM users WHERE id = ?`)
    .bind(id)
    .first();

  if (!existing) {
    await db.prepare(
      `INSERT INTO users (id, first_name, username, created_at)
       VALUES (?, ?, ?, datetime('now'))`
    ).bind(id, first_name || '', username || '').run();
  }
}

/* =====================
   MCQ BANK
===================== */
export async function insertMCQ(db, mcq) {
  const {
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct,
    subject,
    topic,
    difficulty,
    explanation,
    hash
  } = mcq;

  return db.prepare(
    `INSERT OR IGNORE INTO mcq_bank
     (question, option_a, option_b, option_c, option_d,
      correct, subject, topic, difficulty, explanation, hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct,
    subject,
    topic,
    difficulty,
    explanation,
    hash
  ).run();
}

/* =====================
   MCQ FETCH (30 DAY RULE)
===================== */
export async function fetchMCQForUser(db, userId, limit) {
  return db.prepare(
    `
    SELECT *
    FROM mcq_bank
    WHERE id NOT IN (
      SELECT mcq_id
      FROM user_mcq_history
      WHERE user_id = ?
        AND attempted_at >= datetime('now', '-30 days')
    )
    ORDER BY RANDOM()
    LIMIT ?
    `
  ).bind(userId, limit).all();
}

/* =====================
   SAVE MCQ ATTEMPT
===================== */
export async function saveMCQAttempt(db, userId, mcqId) {
  return db.prepare(
    `INSERT INTO user_mcq_history (user_id, mcq_id, attempted_at)
     VALUES (?, ?, datetime('now'))`
  ).bind(userId, mcqId).run();
}

/* =====================
   TEST SESSION
===================== */
export async function createTestSession(db, data) {
  const { user_id, test_type, total } = data;

  return db.prepare(
    `INSERT INTO test_sessions
     (user_id, test_type, total_questions, started_at)
     VALUES (?, ?, ?, datetime('now'))`
  ).bind(user_id, test_type, total).run();
}

export async function finishTestSession(db, sessionId, score) {
  return db.prepare(
    `UPDATE test_sessions
     SET score = ?, finished_at = datetime('now')
     WHERE id = ?`
  ).bind(score, sessionId).run();
    }
