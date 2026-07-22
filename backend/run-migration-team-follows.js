import { pool } from './src/config/db.config.js';
import dotenv from 'dotenv';
dotenv.config();

// Companion Hub: users can follow teams. Run once: node run-migration-team-follows.js
const runMigration = async () => {
    try {
        console.log('Running TeamFollows migration...');
        const sql = `
            CREATE TABLE IF NOT EXISTS TeamFollows (
                user_id    bigint NOT NULL,
                team_id    bigint NOT NULL,
                created_at timestamptz NOT NULL DEFAULT now(),

                PRIMARY KEY (user_id, team_id),

                CONSTRAINT fk_follow_user
                    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,

                CONSTRAINT fk_follow_team
                    FOREIGN KEY (team_id) REFERENCES Teams(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_team_follows_user ON TeamFollows(user_id);
            CREATE INDEX IF NOT EXISTS idx_team_follows_team ON TeamFollows(team_id);
        `;

        await pool.query(sql);
        console.log('TeamFollows migration completed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
