//product.route.js
import express from "express";
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/product", createProduct);
router.get("/products", getAllProducts);
router.get("/product/:id", getProductById);
router.put("/product/:id", updateProduct);
router.delete("/product/:id", deleteProduct);

export default router;