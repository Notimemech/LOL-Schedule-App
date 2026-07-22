import * as notificationService from '../services/notificationService.js';

export const getMyNotifications = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = parseInt(req.query.offset, 10) || 0;
        if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });
        const notifs = await notificationService.getNotifications(userId, { limit, offset });
        res.status(200).json({ success: true, data: notifs });
    } catch (e) {
        next(e);
    }
};

export const getUnreadCount = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });
        const count = await notificationService.getUnreadCount(userId);
        res.status(200).json({ success: true, data: { count } });
    } catch (e) {
        next(e);
    }
};

export const markRead = async (req, res, next) => {
    try {
        const { userId, id } = req.params;
        if (!userId || !id) return res.status(400).json({ success: false, message: 'Missing userId or id' });
        const notif = await notificationService.markAsRead(userId, id);
        res.status(200).json({ success: true, data: notif });
    } catch (e) {
        next(e);
    }
};

export const markAllRead = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });
        const result = await notificationService.markAllRead(userId);
        res.status(200).json({ success: true, data: result });
    } catch (e) {
        next(e);
    }
};
