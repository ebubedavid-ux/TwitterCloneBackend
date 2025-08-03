import express from "express";
import { getCommentsByTweet, addComment,  getCommentCountByTweet } from "../controllers/commentController.js";

const router = express.Router();
import isAuthenticated from "../config/auth.js";

router.route("/:tweetId").get(isAuthenticated,  getCommentsByTweet);
router.route("/").post(isAuthenticated,   addComment);
router.route("/count/:tweetId").get(isAuthenticated, getCommentCountByTweet);

export default router;
