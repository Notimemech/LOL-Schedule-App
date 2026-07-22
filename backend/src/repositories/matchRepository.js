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
    // Join to get team names, tournament name, market status and real winner odds.
    // Odds come from the odds table (option_key = team slug) so list screens
    // never have to fabricate values client-side.
    const query = `
        SELECT m.*,
               mt.match_type as match_type_name,
               t1.name as team1_name, t1.logo_url as team1_logo, t1.code as team1_code, t1.slug as team1_slug,
               t2.name as team2_name, t2.logo_url as team2_logo, t2.code as team2_code, t2.slug as team2_slug,
               tw.slug as winner_slug,
               tr.name as tournament_name,
               tr.id as tournament_id,
               l.name as league_name,
               bm.status as market_status,
               bm.closes_at as market_closes_at,
               bm.team1_odd,
               bm.team2_odd
        FROM matches m
        JOIN matchtypes mt ON m.match_type_id = mt.id
        JOIN teams t1 ON m.team1_id = t1.id
        JOIN teams t2 ON m.team2_id = t2.id
        LEFT JOIN teams tw ON m.winner_team_id = tw.id
        JOIN tournaments tr ON m.tournament_id = tr.id
        JOIN leagues l ON tr.league_id = l.id
        LEFT JOIN LATERAL (
            SELECT bm2.status, bm2.closes_at,
                   (SELECT o.odd_value FROM odds o
                    WHERE o.market_id = bm2.id AND o.option_key = t1.slug LIMIT 1) as team1_odd,
                   (SELECT o.odd_value FROM odds o
                    WHERE o.market_id = bm2.id AND o.option_key = t2.slug LIMIT 1) as team2_odd
            FROM betmarkets bm2
            WHERE bm2.match_id = m.id AND bm2.market_type = 'winner_team'
            ORDER BY bm2.id ASC LIMIT 1
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


