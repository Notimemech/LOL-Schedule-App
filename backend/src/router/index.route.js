import express from 'express';
import { userRouter } from './user.route.js';
import { tournamentRouter } from './tournament.route.js';
import { leagueRouter } from './league.route.js';
import { teamRouter } from './team.route.js';

export const router = express.Router();

router.use('/users',userRouter);
router.use('/tournaments', tournamentRouter);
router.use('/leagues', leagueRouter);
router.use('/teams', teamRouter)