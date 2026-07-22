import express from 'express';
import * as matchController from '../controllers/matchController.js';

export const matchRouter = express.Router();

matchRouter.get('/', matchController.getAllMatches);

// Companion Hub routes
matchRouter.get('/followed/:userId', matchController.getFollowedMatches);
matchRouter.post('/:matchId/follow', matchController.followMatch);
matchRouter.delete('/:matchId/follow/:userId', matchController.unfollowMatch);

matchRouter.get('/:id', matchController.getMatchById);
matchRouter.post('/', matchController.createMatch);
matchRouter.put('/:id', matchController.updateMatch);
