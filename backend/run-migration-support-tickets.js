import { pool } from './src/config/db.config.js';
import dotenv from 'dotenv';
dotenv.config();

// Help Center: user-submitted support tickets. Run once: node run-migration-support-tickets.js
const runMigration = async () => {
    try {
        console.log('Running SupportTickets migration...');
        const sql = `
            CREATE TABLE IF NOT EXISTS SupportTickets (
                id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                user_id     bigint      NOT NULL,
                category    text        NOT NULL,
                subject     text        NOT NULL,
                message     text        NOT NULL,
                status      text        NOT NULL DEFAULT 'open',
                created_at  timestamptz NOT NULL DEFAULT now(),

                CONSTRAINT fk_ticket_user
                    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_support_tickets_user   ON SupportTickets(user_id);
            CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON SupportTickets(status);
        `;

        await pool.query(sql);
        console.log('SupportTickets migration completed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
