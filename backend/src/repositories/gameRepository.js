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

// ===== Game detail page (players, MVP, key events, gold) =====

export const getGameDetail = async (id) => {
    const query = `
        SELECT g.*,
               t1.name AS team1_name, t1.code AS team1_code, t1.logo_url AS team1_logo, t1.slug AS team1_slug,
               t2.name AS team2_name, t2.code AS team2_code, t2.logo_url AS team2_logo, t2.slug AS team2_slug,
               m.tournament_id, tr.name AS tournament_name, l.name AS league_name
        FROM games g
        JOIN teams t1 ON g.team1_id = t1.id
        JOIN teams t2 ON g.team2_id = t2.id
        JOIN matches m ON g.match_id = m.id
        JOIN tournaments tr ON m.tournament_id = tr.id
        JOIN leagues l ON tr.league_id = l.id
        WHERE g.id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

export const getGamePlayerStats = async (gameId) => {
    const query = `
        SELECT s.team_id, s.champion, s.kills, s.deaths, s.assists, s.is_mvp,
               p.in_game_name, p.role
        FROM gameplayerstats s
        JOIN players p ON s.player_id = p.id
        WHERE s.game_id = $1
        ORDER BY s.team_id,
                 CASE p.role
                     WHEN 'TOP' THEN 1 WHEN 'JUNGLE' THEN 2 WHEN 'MID' THEN 3
                     WHEN 'ADC' THEN 4 WHEN 'SUPPORT' THEN 5
                     WHEN 'CARRY' THEN 1 WHEN 'OFFLANE' THEN 3
                     WHEN 'SOFT SUPPORT' THEN 4 WHEN 'HARD SUPPORT' THEN 5
                     ELSE 6
                 END;
    `;
    const { rows } = await pool.query(query, [gameId]);
    return rows;
};

export const getGameEvents = async (gameId) => {
    const query = `
        SELECT event_type, team_id, game_minute, description
        FROM gameevents
        WHERE game_id = $1
        ORDER BY game_minute ASC, id ASC;
    `;
    const { rows } = await pool.query(query, [gameId]);
    return rows;
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
