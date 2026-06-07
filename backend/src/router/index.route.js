import express from 'express';
import { userRouter } from './user.route.js';
import { tournamentRouter } from './tournament.route.js';

export const router = express.Router();

router.use('/users',userRouter);
router.use('/tournaments', tournamentRouter);