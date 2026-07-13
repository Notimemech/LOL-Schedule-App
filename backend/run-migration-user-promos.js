import { pool } from './src/config/db.config.js';
import dotenv from 'dotenv';
dotenv.config();

const runMigration = async () => {
    const client = await pool.connect();
    try {
        console.log('Running migration for UserPromotions...');
        await client.query('BEGIN');
        
        // 1. Add bonus columns to Promotions if not exists
        await client.query(`
            ALTER TABLE Promotions 
            ADD COLUMN IF NOT EXISTS bonus_percentage NUMERIC DEFAULT 0,
            ADD COLUMN IF NOT EXISTS max_bonus NUMERIC DEFAULT 0;
        `);

        // Update existing promotion to have 100% bonus up to 2.000.000
        await client.query(`
            UPDATE Promotions 
            SET bonus_percentage = 100, max_bonus = 2000000 
            WHERE title = 'DOUBLE YOUR DEPOSIT!';
        `);

        // 2. Create UserPromotions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS UserPromotions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES Users(id),
                promotion_id INTEGER NOT NULL REFERENCES Promotions(id),
                status VARCHAR(50) DEFAULT 'used',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, promotion_id)
            );
        `);

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
    }
};

runMigration();
