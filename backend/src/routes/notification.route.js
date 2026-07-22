import express from 'express';
import * as notificationController from '../controllers/notificationController.js';

export const notificationRouter = express.Router();

notificationRouter.get('/:userId', notificationController.getMyNotifications);
notificationRouter.get('/:userId/unread-count', notificationController.getUnreadCount);
notificationRouter.put('/:userId/read-all', notificationController.markAllRead);
notificationRouter.put('/:userId/:id/read', notificationController.markRead);
