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
  const {name, slug} = req.body;

  const query = `INSERT INTO leagues (name, slug)
        values ($1, $2) 
        returning id, name, slug`;

  const rs = await pool.query(query, [name, slug]);

  return rs.rows[0];
};

export const updateLeague = async (id, body) => {

    const {name, slug} = body;

  const query = `UPDATE leagues SET name = $1, slug = $2 WHERE id = $3 RETURNING id, name, slug`;

  const rs = await pool.query(query, [name,slug, id]);

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
