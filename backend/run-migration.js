import fs from 'fs';
import path from 'path';
import { pool } from './src/config/db.config.js';
import dotenv from 'dotenv';
dotenv.config();

const runMigration = async () => {
    try {
        console.log('Running migration...');
        const sql = `
            CREATE TABLE IF NOT EXISTS Promotions (
                id SERIAL PRIMARY KEY,
                user_id bigint REFERENCES Users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                subtitle TEXT NOT NULL,
                badge_text VARCHAR(100),
                quote_text TEXT,
                button_text VARCHAR(100),
                button_link VARCHAR(255),
                is_active BOOLEAN DEFAULT true,
                bonus_percentage NUMERIC DEFAULT 0,
                max_bonus NUMERIC DEFAULT 0,
                expires_at timestamptz DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- Sẽ không INSERT nếu đã có
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM Promotions WHERE is_active = true) THEN
                    INSERT INTO Promotions 
                        (title, subtitle, badge_text, quote_text, button_text, button_link, is_active, bonus_percentage, max_bonus)
                    VALUES 
                        ('DOUBLE YOUR DEPOSIT!', 'Get +100% bonus on your first top-up up to 2.000.000đ!', 'LIMITED OFFER', '🔥 HOT PROMO: Deposit now to unlock exclusive 2026 VCS Odds!', 'CLAIM 100% BONUS NOW', 'Deposit', true, 100, 2000000);
                END IF;
            END $$;
        `;
        
        await pool.query(sql);
        console.log('Migration completed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
