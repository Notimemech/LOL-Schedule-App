import { pool } from '../config/db.config.js';

export const createGame = async (gameData) => {
    const { match_id, team1_id, team2_id, team1_kill, team2_kill, first_blood_team_id, winner_team_id, state } = gameData;
    const query = `
        INSERT INTO games (match_id, team1_id, team2_id, team1_kill, team2_kill, first_blood_team_id, winner_team_id, state)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const values = [
        match_id, 
        team1_id, 
        team2_id, 
        team1_kill || 0, 
        team2_kill || 0, 
        first_blood_team_id || null, 
        winner_team_id || null, 
        state || 'upcoming'
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const getGameById = async (id) => {
    const query = `SELECT * FROM games WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

export const getGamesByMatchId = async (matchId) => {
    const query = `SELECT * FROM games WHERE match_id = $1 ORDER BY id ASC`;
    const { rows } = await pool.query(query, [matchId]);
    return rows;
};

export const updateGameState = async (id, updateData) => {
    const { team1_kill, team2_kill, first_blood_team_id, winner_team_id, state } = updateData;
    const query = `
        UPDATE games 
        SET 
            team1_kill = COALESCE($1, team1_kill),
            team2_kill = COALESCE($2, team2_kill),
            first_blood_team_id = COALESCE($3, first_blood_team_id),
            winner_team_id = COALESCE($4, winner_team_id),
            state = COALESCE($5, state)
        WHERE id = $6
        RETURNING *;
    `;
    const values = [team1_kill, team2_kill, first_blood_team_id, winner_team_id, state, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};
