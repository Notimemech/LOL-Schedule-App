import express from 'express';
import * as helpController from '../controllers/helpController.js';

export const helpRouter = express.Router();

// Help Center: AI support chat + escalation tickets.
helpRouter.post('/chat', helpController.chat);
helpRouter.post('/tickets', helpController.createTicket);
helpRouter.get('/tickets/:userId', helpController.getTickets);
