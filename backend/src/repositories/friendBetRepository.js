import { pool } from '../config/db.config.js';

export const getMatchForBet = async (matchId) => {
    const query = `
        SELECT id, state, scheduled_at, team1_id, team2_id
        FROM matches
        WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [matchId]);
    return rows[0] || null;
};

export const createFriendBet = async ({
    matchId,
    name,
    stakeLabel,
    creatorId,
    opponentId,
    creatorTeamId,
    opponentTeamId,
}) => {
    const query = `
        INSERT INTO friendbets
            (match_id, name, stake_label, creator_id, opponent_id, creator_team_id, opponent_team_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [matchId, name, stakeLabel, creatorId, opponentId, creatorTeamId, opponentTeamId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

// Lazy settlement: whenever a pair's history is read, close out any active
// wagers whose match already ended. Winner mirrors the official match result;
// no result (cancelled/draw) voids the wager.
export const settleBetsForPair = async (userA, userB) => {
    const query = `
        UPDATE friendbets fb
        SET status = CASE
                WHEN m.winner_team_id IN (fb.creator_team_id, fb.opponent_team_id) THEN 'settled'
                ELSE 'void'
            END,
            winner_user_id = CASE
                WHEN m.winner_team_id = fb.creator_team_id THEN fb.creator_id
                WHEN m.winner_team_id = fb.opponent_team_id THEN fb.opponent_id
                ELSE NULL
            END,
            settled_at = now()
        FROM matches m
        WHERE fb.match_id = m.id
          AND fb.status = 'active'
          AND m.state IN ('finished', 'cancelled')
          AND LEAST(fb.creator_id, fb.opponent_id) = LEAST($1::bigint, $2::bigint)
          AND GREATEST(fb.creator_id, fb.opponent_id) = GREATEST($1::bigint, $2::bigint);
    `;
    const result = await pool.query(query, [userA, userB]);
    return result.rowCount;
};

export const getBetsBetween = async (userA, userB) => {
    const query = `
        SELECT fb.*,
               m.state AS match_state, m.scheduled_at AS match_time,
               m.team1_score, m.team2_score,
               tc.code AS creator_team_code, tc.name AS creator_team_name, tc.logo_url AS creator_team_logo,
               to_.code AS opponent_team_code, to_.name AS opponent_team_name, to_.logo_url AS opponent_team_logo,
               l.name AS league_name
        FROM friendbets fb
        JOIN matches m ON fb.match_id = m.id
        JOIN teams tc ON fb.creator_team_id = tc.id
        JOIN teams to_ ON fb.opponent_team_id = to_.id
        JOIN tournaments tr ON m.tournament_id = tr.id
        JOIN leagues l ON tr.league_id = l.id
        WHERE LEAST(fb.creator_id, fb.opponent_id) = LEAST($1::bigint, $2::bigint)
          AND GREATEST(fb.creator_id, fb.opponent_id) = GREATEST($1::bigint, $2::bigint)
        ORDER BY fb.created_at DESC;
    `;
    const { rows } = await pool.query(query, [userA, userB]);
    return rows;
};
