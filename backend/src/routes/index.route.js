import express from 'express';
import { userRouter } from './user.route.js';
import { tournamentRouter } from './tournament.route.js';
import { leagueRouter } from './league.route.js';
import { teamRouter } from './team.route.js';
import { authRouter } from './auth.route.js';
import { walletRouter } from './wallet.route.js';
import { matchRouter } from './match.route.js';
import { betRouter } from './bet.route.js';
import { gameRouter } from './game.route.js';
import { promotionRouter } from './promotion.route.js';

import { vipRouter } from './vip.route.js';
import { notificationRouter } from './notification.route.js';

export const router = express.Router();

router.use('/users',userRouter);
router.use('/tournaments', tournamentRouter);
router.use('/leagues', leagueRouter);
router.use('/teams', teamRouter);
router.use('/auth', authRouter);
router.use('/wallet', walletRouter);
router.use('/matches', matchRouter);
router.use('/bets', betRouter);
router.use('/games', gameRouter);
router.use('/promotions', promotionRouter);
router.use('/vip', vipRouter);
router.use('/notifications', notificationRouter);