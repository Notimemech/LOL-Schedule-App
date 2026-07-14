import * as notificationService from '../services/notificationService.js';

export const getMyNotifications = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ success: false, message: 'Thiếu userId' });
        const notifs = await notificationService.getNotifications(userId);
        res.status(200).json({ success: true, data: notifs });
    } catch (e) {
        next(e);
    }
};

export const markRead = async (req, res, next) => {
    try {
        const { userId, id } = req.params;
        if (!userId || !id) return res.status(400).json({ success: false, message: 'Thiếu userId hoặc id' });
        const notif = await notificationService.markAsRead(userId, id);
        res.status(200).json({ success: true, data: notif });
    } catch (e) {
        next(e);
    }
};
