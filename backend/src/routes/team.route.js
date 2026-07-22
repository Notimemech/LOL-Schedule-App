import express from 'express';
import * as teamController from '../controllers/teamController.js'

export const teamRouter = express.Router();

teamRouter.get('/', teamController.getAllTeams);

// Companion Hub routes — must be registered BEFORE the '/:slug' catch-all.
teamRouter.get('/explore', teamController.getTeamsExplore);
teamRouter.get('/h2h/:team1Id/:team2Id', teamController.getHeadToHead);
teamRouter.get('/followed/:userId', teamController.getFollowedTeams);
teamRouter.get('/:slug/profile', teamController.getTeamProfile);
teamRouter.post('/:teamId/follow', teamController.followTeam);
teamRouter.delete('/:teamId/follow/:userId', teamController.unfollowTeam);

teamRouter.get('/:slug', teamController.getTeamBySlug);
teamRouter.post('/', teamController.createTeam);
teamRouter.put('/:id', teamController.updateTeam);
teamRouter.delete('/:slug', teamController.deleteTeamBySlug);
