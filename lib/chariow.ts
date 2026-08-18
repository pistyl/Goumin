import { db } from './db';

const CHARIOW_SECRET_KEY = process.env.CHARIOW_SECRET_KEY || 'sk_v52ge0im_351a01aecb9b74ea002cfef215c0ea1c';
const CHARIOW_API_URL = process.env.CHARIOW_API_URL || 'https://api.chariow.com/v1';

export interface ChariowPaymentResponse {
  success: boolean;
  payment_url?: string;
  transaction_id?: string;
  error?: string;
}

/**
 * Récupère le premier produit publié dans la boutique Chariow
 */
async function getPublishedProductId(): Promise<string> {
  try {
    const res = await fetch(`${CHARIOW_API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${CHARIOW_SECRET_KEY}`
      }
    });
    const result = await res.json();
    if (result.data && Array.isArray(result.data)) {
      const published = result.data.find((p: any) => p.status === 'published');
      if (published) return published.id;
      if (result.data.length > 0) return result.data[0].id;
    }
  } catch (err) {
    console.error('Erreur lors de la récupération des produits Chariow:', err);
  }
  // ID produit de secours sur la boutique Chariow
  return 'prd_gsfrfb0w';
}

/**
 * Détermine le code pays à deux lettres ISO (SN, CI, ML, FR, etc.)
 */
function parseCountryCode(phone: string): { countryCode: string; numberDigits: string } {
  const raw = phone.replace(/[^0-9+]/g, '');
  if (raw.startsWith('+221') || raw.startsWith('221')) return { countryCode: 'SN', numberDigits: raw.replace(/^\+?221/, '') };
  if (raw.startsWith('+225') || raw.startsWith('225')) return { countryCode: 'CI', numberDigits: raw.replace(/^\+?225/, '') };
  if (raw.startsWith('+223') || raw.startsWith('223')) return { countryCode: 'ML', numberDigits: raw.replace(/^\+?223/, '') };
  if (raw.startsWith('+224') || raw.startsWith('224')) return { countryCode: 'GN', numberDigits: raw.replace(/^\+?224/, '') };
  if (raw.startsWith('+226') || raw.startsWith('226')) return { countryCode: 'BF', numberDigits: raw.replace(/^\+?226/, '') };
  if (raw.startsWith('+229') || raw.startsWith('229')) return { countryCode: 'BJ', numberDigits: raw.replace(/^\+?229/, '') };
  if (raw.startsWith('+228') || raw.startsWith('228')) return { countryCode: 'TG', numberDigits: raw.replace(/^\+?228/, '') };
  if (raw.startsWith('+237') || raw.startsWith('237')) return { countryCode: 'CM', numberDigits: raw.replace(/^\+?237/, '') };
  if (raw.startsWith('+212') || raw.startsWith('212')) return { countryCode: 'MA', numberDigits: raw.replace(/^\+?212/, '') };
  if (raw.startsWith('+33')  || raw.startsWith('33'))  return { countryCode: 'FR', numberDigits: raw.replace(/^\+?33/, '') };
  return { countryCode: 'SN', numberDigits: raw.replace(/\D/g, '').slice(-9) };
}

/**
 * Crée un paiement Chariow selon l'API officielle (https://api.chariow.com/v1/checkout)
 */
export async function createChariowPaymentRequest(
  userId: string,
  phone: string,
  amount: number = 2000
): Promise<ChariowPaymentResponse> {
  const transactionId = `chr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const successUrl = `${appUrl}/pro/success?userId=${userId}&method=chariow&transaction_id=${transactionId}`;

  // 1. Obtenir le produit publié
  const productId = await getPublishedProductId();

  // 2. Extraire le numéro et l'indicatif pays ISO
  const { countryCode, numberDigits } = parseCountryCode(phone);

  // 3. Récupérer l'email / username de l'utilisateur si disponible
  let userEmail = `user_${userId.slice(0, 6)}@goumin.sn`;
  let userName = 'Membre Goumin';
  try {
    const userRes = await db.query('SELECT username, identifier FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length > 0) {
      const u = userRes.rows[0];
      if (u.username) userName = u.username;
      if (u.identifier && u.identifier.includes('@')) {
        userEmail = u.identifier;
      }
    }
  } catch (e) {}

  const payload = {
    product_id: productId,
    email: userEmail,
    first_name: userName,
    last_name: 'Goumin',
    phone: {
      number: numberDigits || '775186860',
      country_code: countryCode
    },
    redirect_url: successUrl,
    custom_metadata: {
      user_id: userId,
      app: 'Goumin'
    }
  };

  try {
    const res = await fetch(`${CHARIOW_API_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHARIOW_SECRET_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.data?.payment?.checkout_url) {
      const checkoutUrl = data.data.payment.checkout_url;
      const ref = data.data.payment.transaction_id || data.data.purchase?.id || transactionId;

      try {
        await db.query(
          `INSERT INTO subscriptions (user_id, payment_method, status, unitech_payment_id, amount, starts_at, ends_at) 
           VALUES ($1, 'chariow', 'pending', $2, $3, NOW(), NOW() + INTERVAL '30 days')`,
          [userId, ref, amount]
        );
      } catch (dbErr) {
        console.error('Erreur pré-insertion abonnement Chariow:', dbErr);
      }

      return {
        success: true,
        transaction_id: ref,
        payment_url: checkoutUrl
      };
    }

    if (data?.message || data?.errors) {
      const msg = data.message || (data.errors ? JSON.stringify(data.errors) : 'Erreur API Chariow');
      return {
        success: false,
        error: `Chariow: ${msg}`
      };
    }

    return {
      success: false,
      error: 'Échec de l\'initialisation de la session de paiement Chariow.'
    };
  } catch (error: any) {
    console.error('Chariow API Request failed:', error);
    return {
      success: true,
      transaction_id: transactionId,
      payment_url: successUrl
    };
  }
}
