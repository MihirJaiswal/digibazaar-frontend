//product.controller.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createProduct = async (req, res) => {
  const { title, price, description, summary, images, tags, licenseType, formats, productFile, userId } = req.body;

  if (!title || !price || !description || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const product = await prisma.product.create({
      data: { title, price, description, summary, images, tags, licenseType, formats, productFile, userId },
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong", details: error });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong", details: error });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) return res.status(404).json({ error: "Product not found" });

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong", details: error });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, price, description, summary, images, tags, licenseType, formats, productFile } = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { title, price, description, summary, images, tags, licenseType, formats, productFile },
    });

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong", details: error });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong", details: error });
  }
};