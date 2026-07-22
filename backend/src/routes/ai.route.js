import express from 'express';
import * as aiController from '../controllers/aiController.js';

export const aiRouter = express.Router();

aiRouter.post('/predict', aiController.predictMatch);
aiRouter.post('/chat', aiController.chatWithAI);
aiRouter.post('/summarize', aiController.summarizeMatch);
