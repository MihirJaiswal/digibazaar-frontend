//message.controller.js
import { PrismaClient } from '@prisma/client';
import createError from '../utils/createError.js';

const prisma = new PrismaClient();

export const createMessage = async (req, res, next) => {
  try {
    const newMessage = await prisma.message.create({
      data: {
        conversationId: req.body.conversationId,
        userId: req.userId,
        desc: req.body.desc,
      },
    });

    await prisma.conversation.update({
      where: { id: req.body.conversationId },
      data: {
        readBySeller: req.isSeller,
        readByBuyer: !req.isSeller,
        lastMessage: req.body.desc,
      },
    });

    res.status(201).send(newMessage);
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).send(messages);
  } catch (err) {
    next(err);
  }
};
