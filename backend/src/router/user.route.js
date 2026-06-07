import express from 'express';
import * as userController from '../controllers/userController.js'

export const userRouter = express.Router();

userRouter.get('/', userController.getAllUser);
userRouter.get('/:id', userController.getUserById);
userRouter.post('/', userController.createUser);
userRouter.put('/:id', userController.updateUser);
userRouter.delete('/:id', userController.deleteUser);
