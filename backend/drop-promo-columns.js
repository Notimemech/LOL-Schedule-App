import { pool } from './src/config/db.config.js';

async function run() {
    try {
        const client = await pool.connect();
        await client.query(`
            ALTER TABLE Promotions 
            DROP COLUMN IF EXISTS result_label_1,
            DROP COLUMN IF EXISTS result_val_1,
            DROP COLUMN IF EXISTS result_label_2,
            DROP COLUMN IF EXISTS result_val_2,
            DROP COLUMN IF EXISTS result_label_3,
            DROP COLUMN IF EXISTS result_val_3;
        `);
        console.log("Dropped columns successfully.");
        client.release();
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}
run();
