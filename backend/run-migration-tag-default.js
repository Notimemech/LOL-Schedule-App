import { pool } from './src/config/db.config.js';
import dotenv from 'dotenv';
dotenv.config();

// users.tag is NOT NULL — give it a random default so every existing INSERT
// path (register, admin create, seeds) keeps working without code changes.
// Run once: node run-migration-tag-default.js
const runMigration = async () => {
    try {
        console.log('Adding random default for users.tag...');
        await pool.query(`
            CREATE OR REPLACE FUNCTION fn_random_tag() RETURNS varchar AS $$
                SELECT string_agg(
                    substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', (floor(random() * 36))::int + 1, 1),
                    ''
                )
                FROM generate_series(1, 6)
            $$ LANGUAGE sql VOLATILE;
        `);
        await pool.query(`ALTER TABLE users ALTER COLUMN tag SET DEFAULT fn_random_tag();`);

        // Sanity check: the default produces a valid tag.
        const { rows } = await pool.query(`SELECT fn_random_tag() AS sample;`);
        console.log('Sample generated tag:', rows[0].sample);
        console.log('Tag default migration completed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
