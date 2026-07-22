import * as friendService from '../services/friendService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const search = async (req, res, next) => {
    const { userId, handle } = req.query;
    try {
        const result = await friendService.searchByHandle(userId, handle);
        sendSuccess(res, 200, 'User found', result);
    } catch (error) {
        next(error);
    }
};

export const sendRequest = async (req, res, next) => {
    const { userId, handle } = req.body;
    try {
        const request = await friendService.sendFriendRequest(userId, handle);
        sendSuccess(res, 201, 'Friend request sent', request);
    } catch (error) {
        next(error);
    }
};

export const acceptRequest = async (req, res, next) => {
    const { requestId } = req.params;
    const { userId } = req.body;
    try {
        const friendship = await friendService.acceptRequest(requestId, userId);
        sendSuccess(res, 200, 'Friend request accepted', friendship);
    } catch (error) {
        next(error);
    }
};

export const removeFriendship = async (req, res, next) => {
    const { friendshipId, userId } = req.params;
    try {
        await friendService.removeFriendship(friendshipId, userId);
        sendSuccess(res, 200, 'Friendship removed');
    } catch (error) {
        next(error);
    }
};

export const getOverview = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const overview = await friendService.getFriendsOverview(userId);
        sendSuccess(res, 200, 'Friends retrieved successfully', overview);
    } catch (error) {
        next(error);
    }
};

export const changeTag = async (req, res, next) => {
    const { userId } = req.params;
    const { tag } = req.body;
    try {
        const updated = await friendService.changeTag(userId, tag);
        sendSuccess(res, 200, 'Tag updated successfully', updated);
    } catch (error) {
        next(error);
    }
};
