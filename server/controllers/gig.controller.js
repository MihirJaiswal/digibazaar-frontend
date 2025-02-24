//gig.controller.js
import { PrismaClient } from '@prisma/client';
import createError from '../utils/createError.js';

const prisma = new PrismaClient();

export const createGig = async (req, res, next) => {
  if (!req.isSeller)
    return next(createError(403, 'Only sellers can create a gig!'));

  try {
    const newGig = await prisma.gig.create({
      data: {
        userId: req.userId,
        ...req.body,
      },
    });

    res.status(201).json(newGig);
  } catch (err) {
    next(err);
  }
};

export const deleteGig = async (req, res, next) => {
  try {
    const gig = await prisma.gig.findUnique({
      where: { id: req.params.id },
    });

    if (!gig) return next(createError(404, 'Gig not found!'));
    if (gig.userId !== req.userId)
      return next(createError(403, 'You can delete only your gig!'));

    await prisma.gig.delete({
      where: { id: req.params.id },
    });

    res.status(200).send('Gig has been deleted!');
  } catch (err) {
    next(err);
  }
};

export const getGig = async (req, res, next) => {
  try {
    const gig = await prisma.gig.findUnique({
      where: { id: req.params.id },
    });

    if (!gig) return next(createError(404, 'Gig not found!'));

    res.status(200).json(gig);
  } catch (err) {
    next(err);
  }
};

export const getGigs = async (req, res, next) => {
  const { userId, cat, min, max, search, sort } = req.query;

  try {
    const gigs = await prisma.gig.findMany({
      where: {
        ...(userId && { userId }),
        ...(cat && { cat }),
        ...(min || max
          ? {
              price: {
                ...(min && { gte: parseInt(min) }),
                ...(max && { lte: parseInt(max) }),
              },
            }
          : {}),
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
      },
      orderBy: sort ? { [sort]: 'desc' } : undefined,
    });

    res.status(200).json(gigs);
  } catch (err) {
    next(err);
  }
};