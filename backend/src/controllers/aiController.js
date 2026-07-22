import * as aiService from '../services/aiService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const predictMatch = async (req, res, next) => {
    try {
        const { matchId } = req.body;
        if (!matchId) {
            return res.status(400).json({ success: false, message: 'matchId is required' });
        }
        const result = await aiService.predictMatchOutcome(matchId);
        sendSuccess(res, 200, 'AI prediction generated successfully', result);
    } catch (error) {
        next(error);
    }
};

export const chatWithAI = async (req, res, next) => {
    try {
        const { message, history } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'message is required' });
        }
        const reply = await aiService.chatWithEsportAI(message, history);
        sendSuccess(res, 200, 'AI response generated successfully', { reply });
    } catch (error) {
        next(error);
    }
};

export const summarizeMatch = async (req, res, next) => {
    try {
        const { matchId } = req.body;
        if (!matchId) {
            return res.status(400).json({ success: false, message: 'matchId is required' });
        }
        const summary = await aiService.summarizeMatchOutcome(matchId);
        sendSuccess(res, 200, 'AI match summary generated successfully', { summary });
    } catch (error) {
        next(error);
    }
};
