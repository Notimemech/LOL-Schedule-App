import { pool } from '../config/db.config.js';

// ===== User lookup by tag =====

export const findUserByUsernameAndTag = async (username, tag) => {
    // Space-insensitive match: legacy usernames may contain spaces
    // ("Quang Anh") but people naturally type handles without them.
    const query = `
        SELECT id, username, tag, email
        FROM users
        WHERE LOWER(REPLACE(username, ' ', '')) = LOWER(REPLACE($1, ' ', ''))
          AND tag = $2 AND is_active = TRUE
        LIMIT 1;
    `;
    const { rows } = await pool.query(query, [username, tag]);
    return rows[0] || null;
};

export const updateUserTag = async (userId, tag) => {
    const query = `UPDATE users SET tag = $1 WHERE id = $2 RETURNING id, username, tag;`;
    const { rows } = await pool.query(query, [tag, userId]);
    return rows[0] || null;
};

// ===== Friendships =====

export const getFriendshipBetween = async (userA, userB) => {
    const query = `
        SELECT * FROM friendships
        WHERE LEAST(requester_id, addressee_id) = LEAST($1::bigint, $2::bigint)
          AND GREATEST(requester_id, addressee_id) = GREATEST($1::bigint, $2::bigint);
    `;
    const { rows } = await pool.query(query, [userA, userB]);
    return rows[0] || null;
};

export const createFriendRequest = async (requesterId, addresseeId) => {
    const query = `
        INSERT INTO friendships (requester_id, addressee_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [requesterId, addresseeId]);
    return rows[0];
};

export const acceptFriendRequest = async (requestId, addresseeId) => {
    // Only the addressee may accept.
    const query = `
        UPDATE friendships
        SET status = 'accepted'
        WHERE id = $1 AND addressee_id = $2 AND status = 'pending'
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [requestId, addresseeId]);
    return rows[0] || null;
};

export const deleteFriendship = async (friendshipId, userId) => {
    // Either side can decline a pending request or unfriend.
    const query = `
        DELETE FROM friendships
        WHERE id = $1 AND (requester_id = $2 OR addressee_id = $2);
    `;
    const result = await pool.query(query, [friendshipId, userId]);
    return result.rowCount > 0;
};

export const getFriends = async (userId) => {
    const query = `
        SELECT f.id AS friendship_id, f.created_at AS friends_since,
               u.id, u.username, u.tag
        FROM friendships f
        JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END
        WHERE (f.requester_id = $1 OR f.addressee_id = $1) AND f.status = 'accepted'
        ORDER BY u.username ASC;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
};

export const getIncomingRequests = async (userId) => {
    const query = `
        SELECT f.id AS friendship_id, f.created_at,
               u.id, u.username, u.tag
        FROM friendships f
        JOIN users u ON u.id = f.requester_id
        WHERE f.addressee_id = $1 AND f.status = 'pending'
        ORDER BY f.created_at DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
};

export const getOutgoingRequests = async (userId) => {
    const query = `
        SELECT f.id AS friendship_id, f.created_at,
               u.id, u.username, u.tag
        FROM friendships f
        JOIN users u ON u.id = f.addressee_id
        WHERE f.requester_id = $1 AND f.status = 'pending'
        ORDER BY f.created_at DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
};
