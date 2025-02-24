//comment.route.js
import express from "express";
import {
    createComment,
    getCommentsByGig
} from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/comment",createComment);
router.get("/comments/:gigId",getCommentsByGig);

export default router;