import express from 'express';
import * as teamController from '../controllers/teamController.js'

export const teamRouter = express.Router();

teamRouter.get('/', teamController.getAllTeams);
teamRouter.get('/:slug', teamController.getTeamBySlug);
teamRouter.post('/', teamController.createTeam);
teamRouter.put('/:id', teamController.updateTeam);
teamRouter.delete('/:slug', teamController.deleteTeamBySlug);
