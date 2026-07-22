import express from 'express';
import * as friendController from '../controllers/friendController.js';
import * as friendBetController from '../controllers/friendBetController.js';

export const friendRouter = express.Router();

// Friends
friendRouter.get('/search', friendController.search);
friendRouter.post('/requests', friendController.sendRequest);
friendRouter.post('/requests/:requestId/accept', friendController.acceptRequest);
friendRouter.delete('/:friendshipId/:userId', friendController.removeFriendship);
friendRouter.get('/overview/:userId', friendController.getOverview);
friendRouter.put('/tag/:userId', friendController.changeTag);

// Friend bets (honor wagers between two friends)
friendRouter.post('/bets', friendBetController.createBet);
friendRouter.get('/bets/h2h/:userId/:friendId', friendBetController.getHeadToHead);
friendRouter.post('/bets/wrapped/:userId/:friendId', friendBetController.getWrapped);
