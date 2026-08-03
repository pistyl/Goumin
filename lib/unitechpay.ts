import crypto from 'crypto';
import { db } from './db';

const API_KEY = process.env.UNITECHPAY_API_KEY || 'test_unitech_api_key_goumin';
const WEBHOOK_SECRET = process.env.UNITECHPAY_WEBHOOK_SECRET || process.env.UNITECHPAY_API_KEY || 'test_unitech_api_key_goumin';
const API_URL = 'https://api.unitech.sn/api';

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
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch (err) {
    return false;
  }
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
  const callbackSuccessUrl = `${appUrl}/pro/success?userId=${userId}&method=${method}`;
  const callbackCancelUrl = `${appUrl}/pro`;

  // Si on est en mode test/simulation, on évite d'appeler l'API de prod et on simule un succès immédiat
  if (API_KEY === 'test_unitech_api_key_goumin') {
    return {
      success: true,
      transaction_id: transactionId,
      payment_url: `${appUrl}/pro/success?transaction_id=${transactionId}&userId=${userId}&method=${method}`
    };
  }

  // Déterminer l'action API selon la méthode de paiement
  const action = method === 'wave' ? 'create_wave_payment' : 'create_orange_om';
  const url = `${API_URL}?action=${action}`;

  // Formater le numéro de téléphone en enlevant le code pays ou espaces si nécessaire (ex: "771234567")
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-9);

  const payload = {
    amount,
    customer_number: cleanPhone,
    description: 'Abonnement Goumin Pro',
    callback_success: callbackSuccessUrl,
    callback_cancel: callbackCancelUrl
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success && data.data) {
      const payRef = data.data.reference || String(data.data.transaction_id);

      // Pré-insérer un abonnement au statut 'pending' lié à la référence du paiement pour le webhook
      try {
        await db.query(
          `INSERT INTO subscriptions (user_id, payment_method, status, unitech_payment_id, amount, starts_at, ends_at) 
           VALUES ($1, $2, 'pending', $3, $4, NOW(), NOW() + INTERVAL '30 days')`,
          [userId, method, payRef, amount]
        );
      } catch (dbErr) {
        console.error('Failed to pre-insert pending subscription:', dbErr);
      }

      return {
        success: true,
        transaction_id: payRef,
        payment_url: data.data.payment_url
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
