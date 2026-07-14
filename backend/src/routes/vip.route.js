import express from 'express';
import * as vipController from '../controllers/vipController.js';
export const vipRouter = express.Router();

vipRouter.get('/tiers', vipController.getVipTiers);
vipRouter.post('/buy', vipController.buyVip);
vipRouter.get('/status/:userId', vipController.getStatus);
vipRouter.post('/cancel-renew', vipController.cancelAutoRenew);
