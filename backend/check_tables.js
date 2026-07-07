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
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `);
  console.log("Tables:", result.rows.map(r => r.table_name));

  const tables = result.rows.map(r => r.table_name).filter(name => name.includes('wallet') || name.includes('transaction'));
  
  for (const table of tables) {
    const colResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1;
    `, [table]);
    console.log(`Columns for ${table}:`, colResult.rows.map(r => r.column_name));
  }

  process.exit();
}
check();
