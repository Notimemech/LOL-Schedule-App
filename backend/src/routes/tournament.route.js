import express from 'express';
import * as tournamentController from '../controllers/tournamentController.js'

export const tournamentRouter = express.Router();

tournamentRouter.get('/', tournamentController.getAllTournament);
// Static path must be registered before the '/:id' catch-alls.
tournamentRouter.get('/explore', tournamentController.getTournamentsWithTeams);
tournamentRouter.get('/:id/standings', tournamentController.getTournamentStandings);
tournamentRouter.get('/:id', tournamentController.getTournamentById);
tournamentRouter.post('/', tournamentController.createTournament);
tournamentRouter.put('/:id', tournamentController.updateTournaments);
tournamentRouter.delete('/:id', tournamentController.deleteTournaments);
