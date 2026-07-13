import express from 'express';
import * as promotionController from '../controllers/promotionController.js';

export const promotionRouter = express.Router();

promotionRouter.get('/', promotionController.getAllPromotions);
promotionRouter.get('/active', promotionController.getActivePromotion);
