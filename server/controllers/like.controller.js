//likeController.js
import pkg from '@prisma/client';
const { PrismaClient } = pkg;const prisma = new PrismaClient();

export const toggleLike = async (req, res) => {
  const { userId, gigId } = req.body;

  if (!userId || !gigId) return res.status(400).json({ error: "Missing required fields" });

  try {
    const existingLike = await prisma.like.findFirst({ where: { userId, gigId } });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return res.status(200).json({ message: "Like removed" });
    } else {
      const like = await prisma.like.create({ data: { userId, gigId } });
      return res.status(201).json(like);
    }
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong", details: error });
  }
};

export const getAllLikes = async (req, res) => {
  try {
    const likes = await prisma.like.findMany();
    res.status(200).json(likes);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong", details: error });
  }
};