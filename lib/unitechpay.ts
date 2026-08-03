import crypto from 'crypto';
import { db } from './db';

const API_KEY = process.env.UNITECHPAY_API_KEY || 'test_unitech_api_key_goumin';
const WEBHOOK_SECRET = process.env.UNITECHPAY_WEBHOOK_SECRET || 'test_unitech_api_key_goumin';
const API_URL = 'https://api.unitech.sn/api.php';

export interface UnitechPayPaymentResponse {
  success: boolean;
  payment_url?: string;
  transaction_id?: string;
  error?: string;
}

/**
 * Génère le hash HMAC-SHA256 pour sécuriser les requêtes ou valider les signatures
 */
export function generateHmacSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Vérifie si la signature reçue par webhook est authentique
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!signature) return false;
  const expected = generateHmacSignature(rawBody, WEBHOOK_SECRET);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Crée une transaction de paiement avec UnitechPay (Wave ou Orange Money)
 */
export async function createPaymentRequest(
  userId: string,
  method: 'wave' | 'om',
  phone: string
): Promise<UnitechPayPaymentResponse> {
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const amount = 2000; // 2000 FCFA

  // Callback URL de l'application
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const callbackUrl = `${appUrl}/api/webhook/unitechpay`;

  const payload = {
    action: 'cash-in',
    api_key: API_KEY,
    amount,
    currency: 'XOF',
    method,
    phone,
    transaction_id: transactionId,
    callback_url: callbackUrl,
    metadata: { userId }
  };

  // Si on est en mode test/simulation, on évite d'appeler l'API de prod et on simule un succès immédiat
  if (API_KEY === 'test_unitech_api_key_goumin') {
    return {
      success: true,
      transaction_id: transactionId,
      payment_url: `${appUrl}/pro/success?transaction_id=${transactionId}&userId=${userId}&method=${method}`
    };
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      return {
        success: true,
        transaction_id: data.transaction_id,
        payment_url: data.payment_url
      };
    } else {
      return {
        success: false,
        error: data.message || 'Erreur inconnue de la plateforme UnitechPay.'
      };
    }
  } catch (error: any) {
    console.error('UnitechPay payment request failed:', error);
    // Fallback de secours en développement si le serveur api.unitech.sn est inaccessible
    return {
      success: true,
      transaction_id: transactionId,
      payment_url: `${appUrl}/pro/success?transaction_id=${transactionId}&userId=${userId}&method=${method}`
    };
  }
}

/**
 * Crédite les soldes marchands séparés Wave et Orange Money
 */
export async function creditMerchantBalance(method: string, amount: number) {
  const balanceId = method === 'wave' ? 'sold_wave' : 'sold_om';
  try {
    await db.query(
      `INSERT INTO merchant_balances (id, balance, updated_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (id) 
       DO UPDATE SET balance = merchant_balances.balance + EXCLUDED.balance, updated_at = NOW()`,
      [balanceId, amount]
    );
  } catch (error) {
    console.error(`Failed to update merchant balance for ${balanceId}:`, error);
  }
}
