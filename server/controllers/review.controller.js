//review.controller.js
import createError from '../utils/createError.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createReview = async (req, res, next) => {
  if (req.isSeller)
    return next(createError(403, "Sellers can't create a review!"));

  try {
    // Check if the user already reviewed this gig
    const existingReview = await prisma.review.findFirst({
      where: {
        gigId: req.body.gigId,
        userId: req.userId,
      },
    });

    if (existingReview)
      return next(
        createError(403, 'You have already created a review for this gig!')
      );

    // TODO: Check if the user purchased the gig before reviewing

    const newReview = await prisma.review.create({
      data: {
        userId: req.userId,
        gigId: req.body.gigId,
        desc: req.body.desc,
        star: req.body.star,
      },
    });

    // Update the gig's totalStars and starNumber
    await prisma.gig.update({
      where: { id: req.body.gigId },
      data: {
        totalStars: { increment: req.body.star },
        starNumber: { increment: 1 },
      },
    });

    res.status(201).send(newReview);
  } catch (err) {
    next(err);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { gigId: req.params.gigId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).send(reviews);
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review) return next(createError(404, 'Review not found!'));

    if (review.userId !== req.userId)
      return next(createError(403, 'You can delete only your review!'));

    await prisma.review.delete({
      where: { id: req.params.id },
    });

    // Update gig's totalStars and starNumber after deleting review
    await prisma.gig.update({
      where: { id: review.gigId },
      data: {
        totalStars: { decrement: review.star },
        starNumber: { decrement: 1 },
      },
    });

    res.status(200).send('Review has been deleted.');
  } catch (err) {
    next(err);
  }
};