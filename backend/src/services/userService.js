import { pool } from "../db/db.js";
import bcrypt from "bcrypt";

export const getAllUser = async () => {
  const query = "SELECT * FROM users";
  const rs = await pool.query(query);
  return rs.rows;
};

export const getOneUser = async (id) => {
  const query = `SELECT username, role_id, phone, email, is_active FROM users WHERE id = $1`;
  const rs = await pool.query(query, [id]);

  if (rs.rowCount === 0) {
    throw new Error("USER_NOT_FOUND");
  }

  return rs.rows[0];
};

export const createUser = async (req) => {
  const { username, password, roleId, phone, email, isActive } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);

  const phoneChecked = await pool.query("");

  const params = [username, passwordHash, roleId, phone, email, isActive];

  const query = `INSERT INTO users (username, password, role_id, phone, email, is_active)
        values ($1,$2,$3,$4,$5,$6) 
        returning id, username, role_id, phone, email`;

  const rs = await pool.query(query, params);

  return rs.rows[0];
};

export const updateUser = async (id, body) => {
  const allowedFields = ["username", "phone", "email", "is_active"];

  const fields = Object.keys(body).filter(
    (key) => allowedFields.includes(key) && body[key] !== undefined,
  );

  const setClause = fields.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const value = fields.map((key) => body[key]);

  const query = `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING username, role_id, phone, email, is_active`;

  const rs = await pool.query(query, [...value, id]);

  if (rs.rowCount === 0) {
    throw new Error("USER_NOT_FOUND");
  }

  return rs.rows[0];
};

export const deleteUser = async (id) => {
  const query = `UPDATE users SET is_active = false WHERE id = $1`;
  const rs = await pool.query(query, [id]);

  if (rs.rowCount === 0) {
    throw new Error("USER_NOT_FOUND");
  }
  return rs.rows[0];
};
