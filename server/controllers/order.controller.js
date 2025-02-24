//order.controller.js
import createError from '../utils/createError.js';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE);

export const intent = async (req, res, next) => {
  try {
    const gig = await prisma.gig.findUnique({
      where: { id: req.params.id },
    });

    if (!gig) return next(createError(404, 'Gig not found!'));

    const paymentIntent = await stripe.paymentIntents.create({
      amount: gig.price * 100,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    await prisma.order.create({
      data: {
        gigId: gig.id,
        img: gig.cover,
        title: gig.title,
        buyerId: req.userId,
        sellerId: gig.userId,
        price: gig.price,
        paymentIntent: paymentIntent.id,
      },
    });

    res.status(200).send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        ...(req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId }),
        isCompleted: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).send(orders);
  } catch (err) {
    next(err);
  }
};

export const confirm = async (req, res, next) => {
  try {
    await prisma.order.updateMany({
      where: { paymentIntent: req.body.payment_intent },
      data: { isCompleted: true },
    });

    res.status(200).send('Order has been confirmed.');
  } catch (err) {
    next(err);
  }
};