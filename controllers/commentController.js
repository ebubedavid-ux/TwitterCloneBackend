import { Comment } from "../models/commentSchema.js";

// ✅ GET comments for a tweet
export const getCommentsByTweet = async (req, res) => {
  try {
    const { tweetId } = req.params;

    const comments = await Comment.find({ tweetId })
      .populate("userId", "name username profilePhoto")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const addComment = async (req, res) => {
  try {
    const { tweetId, userId, text } = req.body;
    if (!tweetId || !userId || !text) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }
    const comment = await Comment.create({ tweetId, userId, text });
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCommentCountByTweet = async (req, res) => {
  try {
    const { tweetId } = req.params;
    const count = await Comment.countDocuments({ tweetId });
    res.status(200).json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};