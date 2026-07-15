import { pool } from './src/config/db.config.js';

async function run() {
    try {
        const client = await pool.connect();
        
        await client.query(`
            ALTER TABLE Promotions 
            ALTER COLUMN expires_at SET DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days');
        `);

        await client.query(`
            UPDATE Promotions 
            SET expires_at = created_at + INTERVAL '7 days'
            WHERE expires_at IS NULL;
        `);

        console.log("Updated expires_at default successfully.");
        client.release();
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}
run();
