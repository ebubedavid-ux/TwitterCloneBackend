import express from "express";
import {
  createTweet,
  deleteTweet,
  getAllTweet,
  likeOrDislike,
  getFollowingTweets,
  bookmarkTweet,
  getUserTweets,
  getTweet,
  getBookmarkedTweets,
} from "../controllers/tweetController.js";
import {} from "../controllers/tweetController.js";

import isAuthenticated from "../config/auth.js";
const router = express.Router();

router.route("/create").post(isAuthenticated, createTweet);
router.route("/delete/:id").delete(isAuthenticated, deleteTweet);
router.route("/likeordislike/:id").put(isAuthenticated, likeOrDislike);
router.route("/bookmark/:id").put(isAuthenticated, bookmarkTweet);
router.route("/bookmarks").get(isAuthenticated, getBookmarkedTweets);
router.route("/alltweet/:id").get(isAuthenticated, getAllTweet);
router.route("/followingtweet/:id").get(isAuthenticated, getFollowingTweets);
router.route("/getowntweet/:id").get(isAuthenticated, getUserTweets);
router.route("/tweet/:id").get(isAuthenticated, getTweet);
router.get("/counts/:id", async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) return res.status(404).json({ message: "Tweet not found" });

    return res.status(200).json({
      likes: tweet.like.length,
      bookmarks: tweet.bookmarks.length,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;