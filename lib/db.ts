import { Pool } from 'pg';

let pool: Pool;

const databaseUrl = process.env.DATABASE_URL;
let poolConfig: any = {};

if (databaseUrl) {
  try {
    const dbUrl = new URL(databaseUrl);
    poolConfig = {
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port || '5432'),
      database: dbUrl.pathname.replace(/^\//, ''),
      ssl: { rejectUnauthorized: false }
    };
  } catch (err) {
    console.error('Goumin : Échec du parsing natif de DATABASE_URL, repli sur connectionString.', err);
    poolConfig = {
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    };
  }
}

if (process.env.NODE_ENV === 'production') {
  pool = new Pool(poolConfig);
} else {
  // Sécurité HMR : Si le pool global n'existe pas, OU s'il a été précédemment fermé (.ending === true),
  // on crée une nouvelle instance de Pool. Cela répare dynamiquement la connexion sans devoir redémarrer Next.
  if (!(global as any).pgPool || (global as any).pgPool.ending) {
    (global as any).pgPool = new Pool(poolConfig);
  }
  pool = (global as any).pgPool;
}

let dbInitialized = false;

async function ensureDatabaseInitialized() {
  if (dbInitialized) return;

  try {
    // Vérifier si la table users existe dans le schéma public
    const checkRes = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'users'
      );
    `);
    
    const exists = checkRes.rows[0]?.exists;
    if (!exists) {
      console.log('Goumin : Initialisation automatique du schéma dans le schéma public...');
      
      // Exécution de l'initialisation DDL
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(50) UNIQUE NOT NULL,
          identifier VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          subscription_tier VARCHAR(20) NOT NULL DEFAULT 'simple',
          trust_contact VARCHAR(100),
          current_step VARCHAR(50) NOT NULL DEFAULT 'Choc',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS subscriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          payment_method VARCHAR(50),
          status VARCHAR(20) NOT NULL,
          unitech_payment_id VARCHAR(100),
          amount NUMERIC NOT NULL DEFAULT 2000,
          starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS circles (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS posts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          circle_id VARCHAR(50) REFERENCES circles(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          content TEXT NOT NULL,
          is_anonym BOOLEAN NOT NULL DEFAULT FALSE,
          status VARCHAR(20) NOT NULL DEFAULT 'approved',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS reactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL DEFAULT 'passed_here',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT unique_post_user_reaction UNIQUE (post_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS comments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          content TEXT NOT NULL,
          is_passed_here BOOLEAN NOT NULL DEFAULT FALSE,
          status VARCHAR(20) NOT NULL DEFAULT 'approved',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS journal_entries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          prompt TEXT NOT NULL,
          content TEXT NOT NULL,
          mood_score INTEGER NOT NULL DEFAULT 3,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
          post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
          comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
          reason TEXT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS merchant_balances (
          id VARCHAR(50) PRIMARY KEY,
          balance NUMERIC NOT NULL DEFAULT 0,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Seed des cercles par défaut
      const circlesCheck = await pool.query(`SELECT COUNT(*) FROM circles`);
      if (parseInt(circlesCheck.rows[0].count) === 0) {
        await pool.query(`
          INSERT INTO circles (id, name, description) VALUES
          ('rupture-recente', 'Rupture récente', 'Pour ceux qui viennent de traverser le choc de la séparation et ont besoin de vider leur sac.'),
          ('je-rechute', 'Je rechute', 'Ce moment difficile où tu es à deux doigts de contacter ton ex malgré tes promesses. Parlons-en d''abord.'),
          ('amour-distance', 'Amour à distance', 'Gérer l''éloignement, les fuseaux horaires et le manque au quotidien. Partageons nos astuces.'),
          ('deuil-relation', 'Deuil d''une longue relation', 'Quand l''histoire a duré des années et qu''il faut réapprendre à vivre pour soi. Le chemin vers l''acceptation.')
        `);
      }

      // Seed des soldes marchands
      const balanceCheck = await pool.query(`SELECT COUNT(*) FROM merchant_balances`);
      if (parseInt(balanceCheck.rows[0].count) === 0) {
        await pool.query(`
          INSERT INTO merchant_balances (id, balance) VALUES
          ('sold_wave', 0),
          ('sold_om', 0)
        `);
      }

      console.log('Goumin : Base de données initialisée avec succès par auto-démarrage.');
    }
    dbInitialized = true;
  } catch (error) {
    console.error('Goumin : Échec de l\'auto-initialisation de la base de données :', error);
  }
}

export const db = {
  query: async (text: string, params?: any[]) => {
    await ensureDatabaseInitialized();
    return pool.query(text, params);
  },
  pool
};
