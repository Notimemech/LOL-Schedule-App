import express from 'express';
import * as betController from '../controllers/betController.js';

export const betRouter = express.Router();

betRouter.post('/markets', betController.createMarket);

betRouter.patch('/markets/:marketId/status', betController.updateMarketStatus);
betRouter.post('/markets/:marketId/settle-all', betController.settleAllBetsForMarket);
betRouter.post('/markets/auto-close', betController.autoCloseMarkets);
betRouter.post('/odds', betController.createOdd);
betRouter.get('/markets/:matchId', betController.getMatchMarkets);
betRouter.post('/place', betController.placeBet);
betRouter.get('/history/:userId', betController.getBetHistory);
betRouter.get('/user/:userId/match/:matchId', betController.getUserBetsForMatch);
betRouter.get('/match/:matchId/all', betController.getAllBetsForMatch);
betRouter.post('/:betId/cancel', betController.cancelBet);
betRouter.post('/:betId/settle', betController.settleBet);
