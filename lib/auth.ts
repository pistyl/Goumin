import { db } from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'goumin_jwt_secret_token_123';
const COOKIE_NAME = 'goumin_session';

export interface User {
  id: string;
  username: string;
  identifier: string;
  subscription_tier: 'simple' | 'pro';
  trust_contact: string | null;
  current_step: string;
  created_at: Date;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    path: '/'
  });
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function checkAndUpdateSubscription(userId: string, currentTier: string): Promise<string> {
  if (currentTier !== 'pro') return currentTier;
  
  try {
    // Récupérer la dernière souscription active
    const result = await db.query(
      `SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY ends_at DESC LIMIT 1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      // Pas d'abonnement actif enregistré mais l'utilisateur a le tier 'pro' ? On repasse en simple.
      await db.query(`UPDATE users SET subscription_tier = 'simple' WHERE id = $1`, [userId]);
      return 'simple';
    }
    
    const sub = result.rows[0];
    const now = new Date();
    if (new Date(sub.ends_at) < now) {
      // L'abonnement a expiré ! Passage en simple
      await db.query(`UPDATE users SET subscription_tier = 'simple' WHERE id = $1`, [userId]);
      await db.query(`UPDATE subscriptions SET status = 'expired' WHERE id = $1`, [sub.id]);
      return 'simple';
    }
    
    return 'pro';
  } catch (error) {
    console.error('Error checking subscription expiry:', error);
    return currentTier;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    // Vérification et mise à jour automatique en cas d'expiration d'abonnement
    const actualTier = await checkAndUpdateSubscription(user.id, user.subscription_tier);
    user.subscription_tier = actualTier;
    
    return {
      id: user.id,
      username: user.username,
      identifier: user.identifier,
      subscription_tier: user.subscription_tier as 'simple' | 'pro',
      trust_contact: user.trust_contact,
      current_step: user.current_step,
      created_at: new Date(user.created_at)
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function logout() {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
}
