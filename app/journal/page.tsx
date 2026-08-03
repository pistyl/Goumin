import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import JournalClient from '@/components/JournalClient';

const PROMPTS = [
  "Qu'est-ce qui t'a fait sourire aujourd'hui, malgré tout ? 🌸",
  "Quelle est la chose la plus difficile que tu as surmontée aujourd'hui ? 💪",
  "Écris trois choses pour lesquelles tu as de la gratitude aujourd'hui. 🙏",
  "Quelle petite victoire (même infime) as-tu remportée aujourd'hui ? 🏆",
  "Si tu devais exprimer ta colère en une phrase sans filtre, ce serait quoi ? ⚡",
  "Qu'est-ce que tu aurais aimé qu'on te dise aujourd'hui ? 💜",
  "Comment as-tu pris soin de toi aujourd'hui ? ☕"
];

function getDailyPrompt() {
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000);
  return PROMPTS[dayOfYear % PROMPTS.length];
}

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  // Récupérer toutes les entrées de journal de l'utilisateur
  let entriesResult;
  try {
    entriesResult = await db.query(
      `SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );
  } catch (err) {
    console.error('Error fetching journal entries:', err);
    entriesResult = { rows: [] };
  }

  const entries = entriesResult.rows.map(row => ({
    id: row.id,
    prompt: row.prompt,
    content: row.content,
    mood_score: row.mood_score,
    created_at: row.created_at.toISOString()
  }));

  const dailyPrompt = getDailyPrompt();

  return <JournalClient user={user} entries={entries} dailyPrompt={dailyPrompt} />;
}
