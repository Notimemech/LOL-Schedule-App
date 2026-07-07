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
  // Check all custom enum types
  const result = await pool.query(`
    SELECT t.typname, e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    ORDER BY t.typname, e.enumsortorder;
  `);
  
  const enums = {};
  result.rows.forEach(r => {
    if (!enums[r.typname]) enums[r.typname] = [];
    enums[r.typname].push(r.enumlabel);
  });
  
  Object.entries(enums).forEach(([name, values]) => {
    console.log(`${name}: [${values.join(', ')}]`);
  });

  process.exit();
}
check();
