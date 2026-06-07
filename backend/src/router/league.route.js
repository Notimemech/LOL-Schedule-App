import express from 'express';
import * as leagueController from '../controllers/leagueController.js'

export const leagueRouter = express.Router();

leagueRouter.get('/', leagueController.getAllLeagues);
leagueRouter.get('/:id', leagueController.getLeagueBySlug);
leagueRouter.post('/', leagueController.createLeague);
leagueRouter.put('/:id', leagueController.updateLeague);
leagueRouter.delete('/:id', leagueController.deleteLeagueBySlug);
