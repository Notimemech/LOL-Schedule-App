import { pool } from '../config/db.config.js';

// ===== Team profile =====

export const getTeamBySlug = async (slug) => {
    const query = `SELECT id, name, code, slug, logo_url FROM teams WHERE slug = $1`;
    const { rows } = await pool.query(query, [slug]);
    return rows[0] || null;
};

export const getTeamRecentMatches = async (teamId, limit = 10) => {
    const query = `
        SELECT m.id, m.team1_id, m.team2_id, m.team1_score, m.team2_score,
               m.winner_team_id, m.scheduled_at, m.state,
               t1.code AS team1_code, t1.slug AS team1_slug, t1.logo_url AS team1_logo,
               t2.code AS team2_code, t2.slug AS team2_slug, t2.logo_url AS team2_logo,
               tr.name AS tournament_name, l.name AS league_name
        FROM matches m
        JOIN teams t1 ON m.team1_id = t1.id
        JOIN teams t2 ON m.team2_id = t2.id
        JOIN tournaments tr ON m.tournament_id = tr.id
        JOIN leagues l ON tr.league_id = l.id
        WHERE (m.team1_id = $1 OR m.team2_id = $1) AND m.state = 'finished'
        ORDER BY m.scheduled_at DESC
        LIMIT $2;
    `;
    const { rows } = await pool.query(query, [teamId, limit]);
    return rows;
};

export const getTeamUpcomingMatches = async (teamId, limit = 5) => {
    const query = `
        SELECT m.id, m.team1_id, m.team2_id, m.scheduled_at, m.state,
               t1.code AS team1_code, t1.slug AS team1_slug, t1.logo_url AS team1_logo,
               t2.code AS team2_code, t2.slug AS team2_slug, t2.logo_url AS team2_logo,
               tr.name AS tournament_name, l.name AS league_name
        FROM matches m
        JOIN teams t1 ON m.team1_id = t1.id
        JOIN teams t2 ON m.team2_id = t2.id
        JOIN tournaments tr ON m.tournament_id = tr.id
        JOIN leagues l ON tr.league_id = l.id
        WHERE (m.team1_id = $1 OR m.team2_id = $1) AND m.state IN ('upcoming', 'happening')
        ORDER BY m.scheduled_at ASC
        LIMIT $2;
    `;
    const { rows } = await pool.query(query, [teamId, limit]);
    return rows;
};

export const getTeamMatchStats = async (teamId) => {
    const query = `
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE winner_team_id = $1)::int AS wins
        FROM matches
        WHERE (team1_id = $1 OR team2_id = $1)
          AND state = 'finished'
          AND winner_team_id IS NOT NULL;
    `;
    const { rows } = await pool.query(query, [teamId]);
    return rows[0];
};

export const getTeamKillStats = async (teamId) => {
    const query = `
        SELECT COUNT(*)::int AS games_played,
               COALESCE(ROUND(AVG(
                   CASE WHEN team1_id = $1 THEN team1_kill ELSE team2_kill END
               ), 1), 0)::float AS avg_kills,
               COUNT(*) FILTER (WHERE first_blood_team_id = $1)::int AS first_bloods
        FROM games
        WHERE (team1_id = $1 OR team2_id = $1) AND state = 'finished';
    `;
    const { rows } = await pool.query(query, [teamId]);
    return rows[0];
};

// ===== Head to head =====

export const getHeadToHeadSummary = async (team1Id, team2Id) => {
    const query = `
        SELECT COUNT(*)::int AS total_meetings,
               COUNT(*) FILTER (WHERE winner_team_id = $1)::int AS team1_wins,
               COUNT(*) FILTER (WHERE winner_team_id = $2)::int AS team2_wins
        FROM matches
        WHERE state = 'finished'
          AND ((team1_id = $1 AND team2_id = $2) OR (team1_id = $2 AND team2_id = $1));
    `;
    const { rows } = await pool.query(query, [team1Id, team2Id]);
    return rows[0];
};

export const getHeadToHeadRecentMeetings = async (team1Id, team2Id, limit = 5) => {
    const query = `
        SELECT m.id, m.team1_id, m.team2_id, m.team1_score, m.team2_score,
               m.winner_team_id, m.scheduled_at,
               tr.name AS tournament_name
        FROM matches m
        JOIN tournaments tr ON m.tournament_id = tr.id
        WHERE m.state = 'finished'
          AND ((m.team1_id = $1 AND m.team2_id = $2) OR (m.team1_id = $2 AND m.team2_id = $1))
        ORDER BY m.scheduled_at DESC
        LIMIT $3;
    `;
    const { rows } = await pool.query(query, [team1Id, team2Id, limit]);
    return rows;
};

// ===== Explore (tournaments grouped with participating teams) =====

export const getTournamentsWithTeams = async () => {
    // Participating teams are derived from the matches of each tournament.
    const query = `
        SELECT tr.id, tr.name, tr.start_date, tr.end_date,
               l.name AS league_name,
               COALESCE(
                   json_agg(DISTINCT jsonb_build_object(
                       'id', t.id,
                       'name', t.name,
                       'code', t.code,
                       'slug', t.slug,
                       'logo_url', t.logo_url
                   )) FILTER (WHERE t.id IS NOT NULL),
                   '[]'
               ) AS teams
        FROM tournaments tr
        LEFT JOIN leagues l ON tr.league_id = l.id
        LEFT JOIN matches m ON m.tournament_id = tr.id
        LEFT JOIN teams t ON t.id = m.team1_id OR t.id = m.team2_id
        GROUP BY tr.id, tr.name, tr.start_date, tr.end_date, l.name
        ORDER BY tr.start_date DESC NULLS LAST, tr.id DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

// ===== Standings =====

export const getTournamentStandings = async (tournamentId) => {
    const query = `
        SELECT t.id, t.name, t.code, t.slug, t.logo_url,
               COUNT(m.id) FILTER (WHERE m.state = 'finished')::int AS played,
               COUNT(m.id) FILTER (WHERE m.winner_team_id = t.id)::int AS wins,
               COUNT(m.id) FILTER (
                   WHERE m.state = 'finished'
                     AND m.winner_team_id IS NOT NULL
                     AND m.winner_team_id <> t.id
               )::int AS losses
        FROM teams t
        JOIN matches m
          ON (m.team1_id = t.id OR m.team2_id = t.id)
         AND m.tournament_id = $1
        GROUP BY t.id, t.name, t.code, t.slug, t.logo_url
        ORDER BY wins DESC, losses ASC, t.name ASC;
    `;
    const { rows } = await pool.query(query, [tournamentId]);
    return rows;
};

// ===== Follows =====

export const followTeam = async (userId, teamId) => {
    const query = `
        INSERT INTO teamfollows (user_id, team_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, team_id) DO NOTHING
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [userId, teamId]);
    return rows[0] || null;
};

export const unfollowTeam = async (userId, teamId) => {
    const query = `DELETE FROM teamfollows WHERE user_id = $1 AND team_id = $2`;
    const result = await pool.query(query, [userId, teamId]);
    return result.rowCount > 0;
};

export const getFollowedTeams = async (userId) => {
    const query = `
        SELECT t.id, t.name, t.code, t.slug, t.logo_url, tf.created_at AS followed_at
        FROM teamfollows tf
        JOIN teams t ON tf.team_id = t.id
        WHERE tf.user_id = $1
        ORDER BY tf.created_at DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
};

export const isFollowingTeam = async (userId, teamId) => {
    const query = `SELECT 1 FROM teamfollows WHERE user_id = $1 AND team_id = $2`;
    const result = await pool.query(query, [userId, teamId]);
    return result.rowCount > 0;
};
