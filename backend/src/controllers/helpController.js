import * as helpService from '../services/helpService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const chat = async (req, res, next) => {
    const { userId, messages } = req.body;
    try {
        const result = await helpService.chat(userId, messages);
        sendSuccess(res, 200, 'Help chat reply generated', result);
    } catch (error) {
        next(error);
    }
};

export const createTicket = async (req, res, next) => {
    const { userId, category, subject, message } = req.body;
    try {
        const ticket = await helpService.createTicket(userId, category, subject, message);
        sendSuccess(res, 201, 'Support ticket created successfully', ticket);
    } catch (error) {
        next(error);
    }
};

export const getTickets = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const tickets = await helpService.getTicketsByUserId(userId);
        sendSuccess(res, 200, 'Support tickets retrieved successfully', tickets);
    } catch (error) {
        next(error);
    }
};
