import { pool } from '../config/db.config.js';

export const createMatch = async (matchData) => {
    const { match_type_id, tournament_id, block_name, team1_id, team2_id, state, best_of, scheduled_at } = matchData;
    const query = `
        INSERT INTO matches (match_type_id, tournament_id, block_name, team1_id, team2_id, state, best_of, scheduled_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const values = [match_type_id, tournament_id, block_name, team1_id, team2_id, state || 'upcoming', best_of || 3, scheduled_at || new Date()];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const buildMatchFilters = ({ state, matchType, search, dateFrom, dateTo } = {}) => {
    const conditions = [];
    const values = [];
    if (state) {
        values.push(state);
        conditions.push(`m.state = $${values.length}`);
    }
    if (matchType) {
        values.push(matchType);
        conditions.push(`LOWER(mt.match_type) = LOWER($${values.length})`);
    }
    if (dateFrom) {
        values.push(dateFrom);
        conditions.push(`m.scheduled_at >= $${values.length}`);
    }
    if (dateTo) {
        values.push(dateTo);
        conditions.push(`m.scheduled_at < $${values.length}`);
    }
    if (search) {
        values.push(`%${search}%`);
        const i = values.length;
        conditions.push(`(
            t1.name ILIKE $${i} OR t1.code ILIKE $${i} OR
            t2.name ILIKE $${i} OR t2.code ILIKE $${i} OR
            tr.name ILIKE $${i} OR l.name ILIKE $${i}
        )`);
    }
    return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', values };
};

export const getMatches = async (filters = {}) => {
    const { where, values } = buildMatchFilters(filters);
    let paging = '';
    if (filters.limit != null) {
        values.push(filters.limit);
        paging += ` LIMIT $${values.length}`;
        values.push(filters.offset || 0);
        paging += ` OFFSET $${values.length}`;
    }

    const query = `
        SELECT m.*,
               mt.match_type as match_type_name,
               t1.name as team1_name, t1.logo_url as team1_logo, t1.code as team1_code, t1.slug as team1_slug,
               t2.name as team2_name, t2.logo_url as team2_logo, t2.code as team2_code, t2.slug as team2_slug,
               tw.slug as winner_slug,
               tr.name as tournament_name,
               tr.id as tournament_id,
               l.name as league_name, l.logo_url as league_logo,
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
        ${where}
        ORDER BY m.scheduled_at DESC${paging};
    `;
    const { rows } = await pool.query(query, values);
    return rows;
};

export const countMatches = async (filters = {}) => {
    const { where, values } = buildMatchFilters(filters);
    const query = `
        SELECT COUNT(*)::int AS total
        FROM matches m
        JOIN matchtypes mt ON m.match_type_id = mt.id
        JOIN teams t1 ON m.team1_id = t1.id
        JOIN teams t2 ON m.team2_id = t2.id
        JOIN tournaments tr ON m.tournament_id = tr.id
        JOIN leagues l ON tr.league_id = l.id
        ${where};
    `;
    const { rows } = await pool.query(query, values);
    return rows[0].total;
};

export const getMatchById = async (matchId) => {
    const queryMatch = `
        SELECT m.*, 
               t1.name as team1_name, t1.logo_url as team1_logo, t1.code as team1_code, t1.slug as team1_slug,
               t2.name as team2_name, t2.logo_url as team2_logo, t2.code as team2_code, t2.slug as team2_slug,
               tr.name as tournament_name,
               l.name as league_name, l.logo_url as league_logo,
               w.name as winner_team_name, w.code as winner_team_code
        FROM matches m
        JOIN teams t1 ON m.team1_id = t1.id
        JOIN teams t2 ON m.team2_id = t2.id
        JOIN tournaments tr ON m.tournament_id = tr.id
        JOIN leagues l ON tr.league_id = l.id
        LEFT JOIN teams w ON m.winner_team_id = w.id
        WHERE m.id = $1;
    `;
    const { rows: matchRows } = await pool.query(queryMatch, [matchId]);
    if (matchRows.length === 0) return null;

    const match = matchRows[0];

    // Fetch individual games for this match
    const queryGames = `
        SELECT g.*, 
               fb.name as first_blood_team_name, fb.code as first_blood_team_code,
               w.name as winner_team_name, w.code as winner_team_code
        FROM games g
        LEFT JOIN teams fb ON g.first_blood_team_id = fb.id
        LEFT JOIN teams w ON g.winner_team_id = w.id
        WHERE g.match_id = $1
        ORDER BY g.game_number ASC;
    `;
    const { rows: gamesRows } = await pool.query(queryGames, [matchId]);
    match.games = gamesRows;

    // Fetch head-to-head matches between team1 and team2
    const queryH2H = `
        SELECT m.id, m.scheduled_at, m.team1_score, m.team2_score, m.winner_team_id,
               t1.code as team1_code, t2.code as team2_code,
               w.code as winner_code
        FROM matches m
        JOIN teams t1 ON m.team1_id = t1.id
        JOIN teams t2 ON m.team2_id = t2.id
        LEFT JOIN teams w ON m.winner_team_id = w.id
        WHERE ((m.team1_id = $1 AND m.team2_id = $2) OR (m.team1_id = $2 AND m.team2_id = $1))
          AND m.state = 'finished'
          AND m.id != $3
        ORDER BY m.scheduled_at DESC
        LIMIT 5;
    `;
    const { rows: h2hRows } = await pool.query(queryH2H, [match.team1_id, match.team2_id, matchId]);
    match.head_to_head = h2hRows;

    return match;
};

export const updateMatchState = async (matchId, state, team1_score, team2_score, winner_team_id) => {
    const query = `
        UPDATE matches 
        SET state = $1, team1_score = $2, team2_score = $3, winner_team_id = $4, updated_at = now()
        WHERE id = $5 
        RETURNING *;
    `;
    const values = [state, team1_score, team2_score, winner_team_id, matchId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};
