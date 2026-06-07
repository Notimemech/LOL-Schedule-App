import { pool } from "../db/db.js";

export const getAllLeagues = async () => {
  const query = "SELECT * FROM leagues";
  const rs = await pool.query(query);
  return rs.rows;
};

export const getOneLeague = async (slug) => {
  const query = `SELECT * FROM leagues WHERE slug = $1`;
  const rs = await pool.query(query, [slug]);

  if (rs.rowCount === 0) {
    throw new Error("LEAGUE_NOT_FOUND");
  }

  return rs.rows[0];
};

export const createLeague = async (req) => {
  const {name, slug, logo_url} = req.body;

  const params = [name, slug, logo_url];

  const query = `INSERT INTO leagues (name, slug, logo_url)
        values ($1, $2, $3) 
        returning id, name, slug, logo_url`;

  const rs = await pool.query(query, params);

  return rs.rows[0];
};

export const updateLeague = async (id, body) => {

  const allowedFields = ["name", "slug", "logo_url"];

  const fields = Object.keys(body).filter(
    (key) => allowedFields.includes(key) && body[key] !== undefined,
  );

  const setClause = fields.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const value = fields.map((key) => body[key]);

  const query = `UPDATE leagues SET ${setClause} WHERE id = $${fields.length + 1} RETURNING name, slug, logo_url`;

  const rs = await pool.query(query, [...value, id]);

  if (rs.rowCount === 0) {
    throw new Error("LEAGUE_NOT_FOUND");
  }

  return rs.rows[0];
};

export const deleteLeague = async (slug) => {
  const query = `DELETE FROM leagues WHERE slug = $1`;
  const rs = await pool.query(query, [slug]);

  if (rs.rowCount === 0) {
    throw new Error("LEAGUE_NOT_FOUND");
  }
  return rs.rows[0];
};
