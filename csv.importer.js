// csv.importer.js

import { insertMCQ } from './db';
import { generateHash } from './utils';

/* =====================
   CSV IMPORTER
   (Cloudflare Worker compatible)
===================== */
export async function importCSV(env, csvText) {
  const lines = csvText.split('\n').filter(l => l.trim());
  if (lines.length < 2) {
    return { ok: false, message: 'CSV file is empty or invalid.' };
  }

  const header = lines[0].split(',').map(h => h.trim());
  const required = [
    'question',
    'option_a',
    'option_b',
    'option_c',
    'option_d',
    'correct',
    'subject',
    'topic',
    'difficulty',
    'explanation'
  ];

  for (const col of required) {
    if (!header.includes(col)) {
      return { ok: false, message: `Missing column: ${col}` };
    }
  }

  let added = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (!row) {
      skipped++;
      continue;
    }

    const mcq = {
      question: row.question,
      option_a: row.option_a,
      option_b: row.option_b,
      option_c: row.option_c,
      option_d: row.option_d,
      correct: row.correct,
      subject: row.subject,
      topic: row.topic,
      difficulty: row.difficulty,
      explanation: row.explanation,
      hash: generateHash(row.question)
    };

    try {
      await insertMCQ(env.DB, mcq);
      added++;
    } catch (e) {
      skipped++;
    }
  }

  return {
    ok: true,
    added,
    skipped,
    total: lines.length - 1
  };
}

/* =====================
   SIMPLE CSV PARSER
===================== */
function parseCSVLine(line) {
  const parts = line.split(',').map(p => p.trim());
  if (parts.length < 10) return null;

  return {
    question: parts[0],
    option_a: parts[1],
    option_b: parts[2],
    option_c: parts[3],
    option_d: parts[4],
    correct: parts[5],
    subject: parts[6],
    topic: parts[7],
    difficulty: parts[8],
    explanation: parts.slice(9).join(',') // explanation may contain commas
  };
       }
