import { pool } from "../config/db.config.js";
import bcrypt from "bcrypt";

export const getAllTournament = async () => {
  // Include league name so list screens don't need a second request.
  const query = `
    SELECT t.*, l.name AS league_name
    FROM tournaments t
    LEFT JOIN leagues l ON t.league_id = l.id
    ORDER BY t.id DESC
  `;
  const rs = await pool.query(query);
  return rs.rows;
};

export const getOneTournament = async (id) => {
  const query = `SELECT name FROM tournaments WHERE id = $1`;
  const rs = await pool.query(query, [id]);

  if (rs.rowCount === 0) {
    throw new Error("TOURNAMENT_NOT_FOUND");
  }

  return rs.rows[0];
};

export const createTournament = async (req) => {
  const {name} = req.body;

  const query = `INSERT INTO tournaments (name)
        values ($1) 
        returning id, name`;

  const rs = await pool.query(query, [name]);

  return rs.rows[0];
};

export const updateTournaments = async (id, body) => {

    const {name} = body;

  const query = `UPDATE tournaments SET name = $1 WHERE id = $2 RETURNING id, name`;

  const rs = await pool.query(query, [name, id]);

  if (rs.rowCount === 0) {
    throw new Error("TOURNAMENT_NOT_FOUND");
  }

  return rs.rows[0];
};

export const deleteTournaments = async (id) => {
  const query = `DELETE FROM tournaments WHERE id = $1`;
  const rs = await pool.query(query, [id]);

  if (rs.rowCount === 0) {
    throw new Error("TOURNAMENT_NOT_FOUND");
  }
  return rs.rows[0];
};
