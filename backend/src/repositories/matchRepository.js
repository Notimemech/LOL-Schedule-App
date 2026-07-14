import { pool } from '../config/db.config.js';

export const createMatch = async (matchData) => {
    const { match_type_id, tournament_id, block_name, team1_id, team2_id, state } = matchData;
    const query = `
        INSERT INTO matches (match_type_id, tournament_id, block_name, team1_id, team2_id, state)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const values = [match_type_id, tournament_id, block_name, team1_id, team2_id, state || 'upcoming'];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const getMatches = async () => {
    // Join to get team names, tournament name, and market status for badge display
    const query = `
        SELECT m.*, 
               mt.match_type as match_type_name,
               t1.name as team1_name, t1.logo_url as team1_logo, t1.code as team1_code, t1.slug as team1_slug,
               t2.name as team2_name, t2.logo_url as team2_logo, t2.code as team2_code, t2.slug as team2_slug,
               tw.slug as winner_slug,
               tr.name as tournament_name,
               l.name as league_name,
               bm.status as market_status,
               bm.closes_at as market_closes_at
        FROM matches m
        JOIN matchtypes mt ON m.match_type_id = mt.id
        JOIN teams t1 ON m.team1_id = t1.id
        JOIN teams t2 ON m.team2_id = t2.id
        LEFT JOIN teams tw ON m.winner_team_id = tw.id
        JOIN tournaments tr ON m.tournament_id = tr.id
        JOIN leagues l ON tr.league_id = l.id
        LEFT JOIN LATERAL (
            SELECT status, closes_at FROM betmarkets
            WHERE match_id = m.id AND market_type = 'winner_team'
            ORDER BY id ASC LIMIT 1
        ) bm ON true
        ORDER BY m.scheduled_at DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

export const updateMatchState = async (matchId, state, team1_score, team2_score, winner_team_id) => {
    const query = `
        UPDATE matches 
        SET state = $1, team1_score = $2, team2_score = $3, winner_team_id = $4
        WHERE id = $5 
        RETURNING *;
    `;
    const values = [state, team1_score, team2_score, winner_team_id, matchId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};


