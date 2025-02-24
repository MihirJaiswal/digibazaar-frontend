//commentController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createComment = async (req, res) => {
  const { userId, gigId, content } = req.body;

  if (!userId || !gigId || !content) return res.status(400).json({ error: "Missing required fields" });

  try {
    const comment = await prisma.comment.create({ data: { userId, gigId, content } });
    return res.status(201).json(comment);
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong", details: error });
  }
};

export const getCommentsByGig = async (req, res) => {
  const { gigId } = req.params;

  if (!gigId) return res.status(400).json({ error: "Gig ID is required" });

  try {
    const comments = await prisma.comment.findMany({
      where: { gigId },
      include: { user: { select: { username: true, img: true } } },
    });
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong", details: error });
  }
};