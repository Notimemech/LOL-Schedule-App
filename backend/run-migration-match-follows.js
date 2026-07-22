import { pool } from './src/config/db.config.js';
import dotenv from 'dotenv';
dotenv.config();

// Companion Hub: users can follow matches. Run once: node run-migration-match-follows.js
const runMigration = async () => {
    try {
        console.log('Running MatchFollows migration...');
        const sql = `
            CREATE TABLE IF NOT EXISTS MatchFollows (
                user_id    bigint NOT NULL,
                match_id   bigint NOT NULL,
                created_at timestamptz NOT NULL DEFAULT now(),

                PRIMARY KEY (user_id, match_id),

                CONSTRAINT fk_match_follow_user
                    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,

                CONSTRAINT fk_match_follow_match
                    FOREIGN KEY (match_id) REFERENCES Matches(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_match_follows_user  ON MatchFollows(user_id);
            CREATE INDEX IF NOT EXISTS idx_match_follows_match ON MatchFollows(match_id);
        `;

        await pool.query(sql);
        console.log('MatchFollows migration completed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
