import express from 'express';
import * as gameController from '../controllers/gameController.js';

export const gameRouter = express.Router();

gameRouter.post('/', gameController.createGame);
gameRouter.get('/:id', gameController.getGameById);
gameRouter.get('/match/:matchId', gameController.getGamesByMatchId);
gameRouter.patch('/:id/state', gameController.updateGameState);
