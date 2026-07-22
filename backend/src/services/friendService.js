import * as friendRepository from '../repositories/friendRepository.js';
import AppError from '../utils/appError.js';

const TAG_PATTERN = /^[A-Z0-9]{1,6}$/;

// Parse "username#TAG" (tag is case-insensitive on input, stored uppercase).
const parseHandle = (handle) => {
    if (typeof handle !== 'string' || !handle.includes('#')) {
        throw new AppError('Handle must look like username#TAG', 400);
    }
    const hashIndex = handle.lastIndexOf('#');
    const username = handle.slice(0, hashIndex).trim();
    const tag = handle.slice(hashIndex + 1).trim().toUpperCase();
    if (!username || !TAG_PATTERN.test(tag)) {
        throw new AppError('Handle must look like username#TAG (tag: 1-6 letters/digits)', 400);
    }
    return { username, tag };
};

export const searchByHandle = async (userId, handle) => {
    const { username, tag } = parseHandle(handle);
    const user = await friendRepository.findUserByUsernameAndTag(username, tag);
    if (!user) throw new AppError('No user found with that handle', 404);
    if (Number(user.id) === Number(userId)) {
        throw new AppError("That's your own handle", 400);
    }
    const friendship = await friendRepository.getFriendshipBetween(userId, user.id);
    return {
        id: user.id,
        username: user.username,
        tag: user.tag,
        friendshipStatus: friendship?.status || null,
    };
};

export const sendFriendRequest = async (requesterId, handle) => {
    if (!requesterId) throw new AppError('userId is required', 400);
    const target = await searchByHandle(requesterId, handle);
    const existing = await friendRepository.getFriendshipBetween(requesterId, target.id);
    if (existing?.status === 'accepted') throw new AppError('You are already friends', 409);
    if (existing?.status === 'pending') throw new AppError('A friend request already exists', 409);
    return await friendRepository.createFriendRequest(requesterId, target.id);
};

export const acceptRequest = async (requestId, userId) => {
    const updated = await friendRepository.acceptFriendRequest(requestId, userId);
    if (!updated) throw new AppError('Friend request not found', 404);
    return updated;
};

export const removeFriendship = async (friendshipId, userId) => {
    const removed = await friendRepository.deleteFriendship(friendshipId, userId);
    if (!removed) throw new AppError('Friendship not found', 404);
    return true;
};

export const getFriendsOverview = async (userId) => {
    const [friends, incoming, outgoing] = await Promise.all([
        friendRepository.getFriends(userId),
        friendRepository.getIncomingRequests(userId),
        friendRepository.getOutgoingRequests(userId),
    ]);
    return { friends, incoming, outgoing };
};

export const changeTag = async (userId, tag) => {
    const normalized = String(tag || '').trim().toUpperCase();
    if (!TAG_PATTERN.test(normalized)) {
        throw new AppError('Tag must be 1-6 letters/digits', 400);
    }
    try {
        const updated = await friendRepository.updateUserTag(userId, normalized);
        if (!updated) throw new AppError('User not found', 404);
        return updated;
    } catch (error) {
        // Unique (username, tag) violation
        if (error.code === '23505') {
            throw new AppError('That tag is already taken for your username', 409);
        }
        throw error;
    }
};

export const assertFriends = async (userA, userB) => {
    const friendship = await friendRepository.getFriendshipBetween(userA, userB);
    if (!friendship || friendship.status !== 'accepted') {
        throw new AppError('You can only do this with a friend', 403);
    }
    return friendship;
};
