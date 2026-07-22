import { pool } from './src/config/db.config.js';

try {
  await pool.query(`ALTER TABLE Notifications ADD COLUMN IF NOT EXISTS type varchar(50) DEFAULT 'system'`);
  console.log('Migration done: type column added to Notifications');
  process.exit(0);
} catch (e) {
  console.error('Migration failed:', e.message);
  process.exit(1);
}
