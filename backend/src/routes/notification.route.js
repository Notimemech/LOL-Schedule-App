import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
export const notificationRouter = express.Router();

notificationRouter.get('/:userId', notificationController.getMyNotifications);
notificationRouter.put('/:userId/:id/read', notificationController.markRead);
