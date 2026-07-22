import express from 'express';
import * as matchController from '../controllers/matchController.js';

export const matchRouter = express.Router();

matchRouter.get('/', matchController.getAllMatches);

// Companion Hub routes — mirror team follow endpoints (team.route.js).
matchRouter.get('/followed/:userId', matchController.getFollowedMatches);
matchRouter.post('/:matchId/follow', matchController.followMatch);
matchRouter.delete('/:matchId/follow/:userId', matchController.unfollowMatch);

matchRouter.post('/', matchController.createMatch);
matchRouter.put('/:id', matchController.updateMatch);
