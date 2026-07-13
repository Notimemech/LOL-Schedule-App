import * as promotionService from '../services/promotionService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getActivePromotion = async (req, res, next) => {
    try {
        const userId = req.query.userId || -1;
        const promo = await promotionService.getActivePromotion(userId);
        sendSuccess(res, 200, 'Active promotion retrieved', promo);
    } catch (error) {
        next(error);
    }
};

export const getAllPromotions = async (req, res, next) => {
    try {
        const userId = req.query.userId || -1;
        const promos = await promotionService.getAllPromotions(userId);
        sendSuccess(res, 200, 'Promotions retrieved', promos);
    } catch (error) {
        next(error);
    }
};
