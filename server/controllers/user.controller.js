//user.controller.js
import { PrismaClient } from '@prisma/client';
import createError from '../utils/createError.js';

const prisma = new PrismaClient();

export const deleteUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) return next(createError(404, 'User not found!'));

    if (req.userId !== user.id) {
      return next(createError(403, 'You can delete only your account!'));
    }

    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.status(200).send('User has been deleted.');
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) return next(createError(404, 'User not found!'));

    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
};