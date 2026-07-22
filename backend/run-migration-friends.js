import { pool } from './src/config/db.config.js';
import dotenv from 'dotenv';
dotenv.config();

// Friends & friend bets: user tag (username#XXXXXX), friendships, friendbets.
// Run once: node run-migration-friends.js

const TAG_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const randomTag = () =>
    Array.from({ length: 6 }, () => TAG_ALPHABET[Math.floor(Math.random() * TAG_ALPHABET.length)]).join('');

const runMigration = async () => {
    try {
        console.log('Running Friends migration...');

        // 1. Users.tag
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tag varchar(6);`);

        // Backfill existing users one by one so we can retry on the (unlikely)
        // username+tag collision.
        const { rows: untagged } = await pool.query(`SELECT id, username FROM users WHERE tag IS NULL`);
        for (const user of untagged) {
            for (let attempt = 0; attempt < 5; attempt++) {
                try {
                    await pool.query(`UPDATE users SET tag = $1 WHERE id = $2`, [randomTag(), user.id]);
                    break;
                } catch (e) {
                    if (attempt === 4) throw e;
                }
            }
        }

        await pool.query(`
            DO $$ BEGIN
                ALTER TABLE users ADD CONSTRAINT chk_users_tag CHECK (tag ~ '^[A-Z0-9]{1,6}$');
            EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        `);
        await pool.query(`ALTER TABLE users ALTER COLUMN tag SET NOT NULL;`);
        await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username_tag ON users (username, tag);`);

        // 2. Friendships
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Friendships (
                id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                requester_id bigint NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
                addressee_id bigint NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
                status       text   NOT NULL DEFAULT 'pending',
                created_at   timestamptz NOT NULL DEFAULT now(),

                CONSTRAINT chk_friend_not_self CHECK (requester_id <> addressee_id)
            );
        `);
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS uq_friendships_pair
            ON Friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON Friendships(addressee_id, status);`);

        // 3. FriendBets — honor wagers, no wallet money involved.
        await pool.query(`
            CREATE TABLE IF NOT EXISTS FriendBets (
                id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                match_id         bigint NOT NULL REFERENCES Matches(id) ON DELETE RESTRICT,
                name             text   NOT NULL,
                stake_label      text   NOT NULL,
                creator_id       bigint NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
                opponent_id      bigint NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
                creator_team_id  bigint NOT NULL REFERENCES Teams(id),
                opponent_team_id bigint NOT NULL REFERENCES Teams(id),
                status           text   NOT NULL DEFAULT 'active',
                winner_user_id   bigint REFERENCES Users(id),
                created_at       timestamptz NOT NULL DEFAULT now(),
                settled_at       timestamptz,

                CONSTRAINT chk_friendbet_not_self CHECK (creator_id <> opponent_id)
            );
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_friendbets_pair
            ON FriendBets (LEAST(creator_id, opponent_id), GREATEST(creator_id, opponent_id));
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_friendbets_match ON FriendBets(match_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_friendbets_status ON FriendBets(status);`);

        console.log('Friends migration completed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
