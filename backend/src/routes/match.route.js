import express from 'express';
import * as matchController from '../controllers/matchController.js';

export const matchRouter = express.Router();

matchRouter.get('/', matchController.getAllMatches);
matchRouter.post('/', matchController.createMatch);
matchRouter.put('/:id', matchController.updateMatch);
