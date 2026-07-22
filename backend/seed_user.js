import bcrypt from 'bcrypt';
import { pool } from './src/config/db.config.js';

async function seed() {
  try {
    const hash = await bcrypt.hash('123456', 10);
    
    // Update sample accounts password to 123456
    await pool.query(
      "UPDATE users SET password = $1 WHERE email IN ('admin@betgg.vn', 'ledat@example.com', 'minhquan@example.com');",
      [hash]
    );

    // Also check if demo user exists, if not create demo user
    const res = await pool.query("SELECT * FROM users WHERE email = 'demo@gmail.com';");
    if (res.rows.length === 0) {
      const roleRes = await pool.query("SELECT id FROM roles LIMIT 1;");
      const roleId = roleRes.rows[0]?.id || 1;
      const newUser = await pool.query(
        `INSERT INTO users (username, password, role_id, phone, email) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
        ['demo', hash, roleId, '0988888888', 'demo@gmail.com']
      );
      const userId = newUser.rows[0].id;
      await pool.query("INSERT INTO wallets (user_id, balance) VALUES ($1, 1000000) ON CONFLICT DO NOTHING;", [userId]);
      console.log('Created demo user: demo@gmail.com');
    }
    
    console.log('Accounts updated successfully!');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    process.exit(0);
  }
}

seed();
