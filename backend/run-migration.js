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
                title VARCHAR(255) NOT NULL,
                subtitle TEXT NOT NULL,
                badge_text VARCHAR(100),
                quote_text TEXT,
                button_text VARCHAR(100),
                button_link VARCHAR(255),
                result_label_1 VARCHAR(255),
                result_val_1 VARCHAR(255),
                result_label_2 VARCHAR(255),
                result_val_2 VARCHAR(255),
                result_label_3 VARCHAR(255),
                result_val_3 VARCHAR(255),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- Sẽ không INSERT nếu đã có
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM Promotions WHERE is_active = true) THEN
                    INSERT INTO Promotions 
                        (title, subtitle, badge_text, quote_text, button_text, button_link, result_label_1, result_val_1, result_label_2, result_val_2, result_label_3, result_val_3, is_active)
                    VALUES 
                        ('DOUBLE YOUR DEPOSIT!', 'Get +100% bonus on your first top-up up to 2.000.000đ!', 'LIMITED OFFER', '🔥 HOT PROMO: 92% of VIPs predicted T1''s victory! Deposit now to unlock exclusive 2026 VCS Odds!', 'CLAIM 100% BONUS NOW', 'Deposit', 'RECENT HOT WIN', 'T1 vs GEN (3 - 2)', 'TOTAL POOL', '100.000đ', 'WINNING ODDS', 'T1 (1.65x)', true);
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
