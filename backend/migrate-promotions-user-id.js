import { pool } from './src/config/db.config.js';

async function run() {
    try {
        const client = await pool.connect();
        await client.query(`
            ALTER TABLE Promotions 
            ADD COLUMN IF NOT EXISTS user_id bigint REFERENCES Users(id) ON DELETE CASCADE,
            ADD COLUMN IF NOT EXISTS expires_at timestamptz;
        `);
        await client.query(`
            UPDATE Promotions p
            SET user_id = up.user_id
            FROM UserPromotions up
            WHERE p.id = up.promotion_id
              AND p.badge_text = 'VIP BONUS'
              AND p.user_id IS NULL;
        `);
        await client.query(`
            UPDATE Promotions p
            SET expires_at = p.created_at + INTERVAL '30 days'
            WHERE p.badge_text = 'VIP BONUS' AND p.expires_at IS NULL;
        `);
        await client.query(`
            DELETE FROM Promotions 
            WHERE badge_text = 'VIP BONUS' AND user_id IS NULL;
        `);
        console.log("Migration executed successfully.");
        client.release();
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

run();
