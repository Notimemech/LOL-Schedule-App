import { pool } from "../config/db.config.js";
import bcrypt from "bcrypt";

export const getAllTeams = async () => {
  const query = "SELECT * FROM teams";
  const rs = await pool.query(query);
  return rs.rows;
};

export const getOneTeamBySlug = async (slug) => {
  const query = `SELECT id, name, code,logo_url FROM teams WHERE slug = $1`;
  const rs = await pool.query(query, [slug]);

  if (rs.rowCount === 0) {
    throw new Error("TEAM_NOT_FOUND");
  }

  return rs.rows[0];
};

export const createTeam = async (req) => {
  const { name, slug, code, logo_url} = req.body;

  const params = [name, slug, code, logo_url];

  const query = `INSERT INTO teams (name, slug, code, logo_url)
        values ($1,$2,$3,$4) 
        returning id, name, slug, code, logo_url`;

  const rs = await pool.query(query, params);

  return rs.rows[0];
};

export const updateTeam = async (id, body) => {
  const allowedFields = ["name", "slug", "code", "logo_url"];

  const fields = Object.keys(body).filter(
    (key) => allowedFields.includes(key) && body[key] !== undefined,
  );

  const setClause = fields.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const value = fields.map((key) => body[key]);

  const query = `UPDATE teams SET ${setClause} WHERE id = $${fields.length + 1} RETURNING name, slug, code, logo_url`;

  const rs = await pool.query(query, [...value, id]);

  if (rs.rowCount === 0) {
    throw new Error("TEAM_NOT_FOUND");
  }

  return rs.rows[0];
};

export const deleteTeamBySlug = async (slug) => {
  const query = `DELETE FROM teams WHERE slug = $1`;
  const rs = await pool.query(query, [slug]);

  if (rs.rowCount === 0) {
    throw new Error("TEAM_NOT_FOUND");
  }
  return rs.rows[0];
};
