import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  password: '1403',
  host: 'localhost',
  port: 5432,
  database: 'BettingMobile',
});

async function check() {
  const result = await pool.query(`
    SELECT * FROM wallets WHERE user_id = 1;
  `);
  console.log("Wallet for user 1:", result.rows);
  process.exit();
}
check();
