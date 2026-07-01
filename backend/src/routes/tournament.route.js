import express from 'express';
import * as tournamentController from '../controllers/tournamentController.js'

export const tournamentRouter = express.Router();

tournamentRouter.get('/', tournamentController.getAllTournament);
tournamentRouter.get('/:id', tournamentController.getTournamentById);
tournamentRouter.post('/', tournamentController.createTournament);
tournamentRouter.put('/:id', tournamentController.updateTournaments);
tournamentRouter.delete('/:id', tournamentController.deleteTournaments);
