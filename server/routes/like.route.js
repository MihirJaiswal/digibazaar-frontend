//like.route.js
import express from "express";
import {
    toggleLike,
    getAllLikes
}from "../controllers/like.controller.js";

const router = express.Router();

router.post("/like", toggleLike);
router.get("/likes", getAllLikes);

export default router;