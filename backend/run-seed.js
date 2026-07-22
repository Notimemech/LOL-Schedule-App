import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './src/config/db.config.js';
import dotenv from 'dotenv';
dotenv.config();

// One-command sample-data import:  npm run seed
// Re-imports seeds/seed.sql (leagues, teams, tournaments, matches, games,
// players, game stats/events, markets, odds, VIP tiers, promotions).
const runSeed = async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const seedFile = path.join(__dirname, 'seeds', 'seed.sql');

    if (!fs.existsSync(seedFile)) {
        console.error(`Seed file not found: ${seedFile}`);
        console.error('Generate it first with: node scripts/generate-seed.js');
        process.exit(1);
    }

    try {
        console.log('Importing seed data...');
        const sql = fs.readFileSync(seedFile, 'utf8');
        await pool.query(sql);
        console.log('Seed import completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Seed import failed:', err);
        process.exit(1);
    }
};

runSeed();
