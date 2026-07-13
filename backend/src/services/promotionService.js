import * as promotionRepository from '../repositories/promotionRepository.js';
import AppError from '../utils/appError.js';

export const getActivePromotion = async (userId) => {
    const promo = await promotionRepository.getActivePromotion(userId);
    return promo;
};

export const getAllPromotions = async (userId) => {
    const promos = await promotionRepository.getAllPromotions(userId);
    return promos;
};
