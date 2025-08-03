import { Tweet } from "../models/tweetSchema.js";
import { User } from "../models/userSchema.js";
import mongoose from "mongoose";


export const createTweet = async (req, res) => {
  try {
    const { description, image, id } = req.body;

    if (!description && !image) {
      return res.status(400).json({
        message: "Tweet must have a description or an image.",
        success: false,
      });
    }
    if (!id) {
      return res.status(400).json({
        message: "User ID is required.",
        success: false,
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }


    const tweet = await Tweet.create({
      description: description || "",
      userId: id,
      image: image || "",
    });

    console.log("BODY RECEIVED:", req.body);


    return res.status(200).json({
      message: "Tweet created successfully.",
      success: true,
      tweet,
    });
  } catch (error) {
    console.error("Error in createTweet:", error);
    return res.status(500).json({
      message: "Server error while creating tweet.",
      success: false,
      error: error.message,
    });
  }
};

export const deleteTweet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Tweet ID is required.",
        success: false,
      });
    }

    const tweet = await Tweet.findById(id);
    if (!tweet) {
      return res.status(404).json({
        message: "Tweet not found.",
        success: false,
      });
    }

  
   if (req.user !== tweet.userId.toString()) {
       return res.status(403).json({
         message: "You are not authorized to delete this tweet.",
         success: false,
      });
    }

    await Tweet.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Tweet deleted successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error in deleteTweet:", error);
    return res.status(500).json({
      message: "Server error while deleting tweet.",
      success: false,
      error: error.message,
    });
  }
};


export const likeOrDislike = async (req, res) => {
  try {
    const loggedInUserId = req.body.id;
    const tweetId = req.params.id;

    if (!loggedInUserId || !tweetId) {
      return res.status(400).json({
        message: "User ID and Tweet ID are required.",
        success: false,
      });
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({
        message: "Tweet not found.",
        success: false,
      });
    }

    if (tweet.like.includes(loggedInUserId)) {
    
      await Tweet.findByIdAndUpdate(tweetId, {
        $pull: { like: loggedInUserId },
      });
      return res.status(200).json({
        message: "Tweet disliked successfully.",
        success: true,
      });
    } else {
      
      await Tweet.findByIdAndUpdate(tweetId, {
        $push: { like: loggedInUserId },
      });
      return res.status(200).json({
        message: "Tweet liked successfully.",
        success: true,
      });
    }
  } catch (error) {
    console.error("Error in likeOrDislike:", error);
    return res.status(500).json({
      message: "Server error while liking/disliking tweet.",
      success: false,
      error: error.message,
    });
  }
};

export const bookmarkTweet = async (req, res) => {
  try {
    const userId = req.user;
    const tweetId = req.params.id;

     console.log("Bookmark toggle request for user:", userId, "tweet:", tweetId);

    const tweet = await Tweet.findById(tweetId);
    const user = await User.findById(userId);

    if (!tweet || !user) {
      return res.status(404).json({ message: "Tweet or user not found" });
    }

      console.log("Before toggle tweet.bookmarks:", tweet.bookmarks);
    console.log("Before toggle user.bookmarks:", user.bookmarks);

    if (tweet.bookmarks.some(id => id.toString() === userId)) {
      tweet.bookmarks = tweet.bookmarks.filter(id => id.toString() !== userId);
    } else {
      tweet.bookmarks.push(userId);
    }

    if (user.bookmarks.some(id => id.toString() === tweetId)) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== tweetId);
    } else {
      user.bookmarks.push(tweetId);
    }

    await tweet.save();
    await user.save();

    console.log("After toggle tweet.bookmarks:", tweet.bookmarks);
    console.log("After toggle user.bookmarks:", user.bookmarks);

    res.status(200).json({ message: "Bookmark toggled", tweet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};




export const getBookmarkedTweets = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user); 

    const tweets = await Tweet.find({ bookmarks: userId })
      .populate("userId", "username name profilePhoto")
      .sort({ createdAt: -1 });

    console.log("Bookmarked tweets:", tweets.length);

    res.status(200).json({ success: true, tweets });
  } catch (error) {
    console.error("Error in getBookmarkedTweets:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getAllTweet = async (req, res) => {
  try {
    const tweets = await Tweet.find() 
      .populate("userId", "name username profilePhoto").populate('bookmarks', 'name')
      .sort({ createdAt: -1 });

       console.log("Fetched Tweets:", tweets.map(tweet => ({
      id: tweet._id,
      desc: tweet.description,
      image: tweet.image
    })));

    return res.status(200).json({
      tweets,
      success: true,
    });
  } catch (error) {
    console.error("Error in getEveryTweet:", error);
    return res.status(500).json({
      message: "Server error while fetching all tweets.",
      success: false,
      error: error.message,
    });
  }
};


export const getFollowingTweets = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        message: "User ID is required.",
        success: false,
      });
    }

    const loggedInUser = await User.findById(id);
    if (!loggedInUser) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    const followingUserTweets = await Promise.all(
      loggedInUser.following.map((otherUsersId) => {
        return Tweet.find({ userId: otherUsersId }).populate("userId", "name username profilePhoto");
      })
    );

    const tweets = [].concat(...followingUserTweets);
    tweets.sort((a, b) => b.createdAt - a.createdAt);

    return res.status(200).json({
      tweets,
      success: true,
    });
  } catch (error) {
    console.error("Error in getFollowingTweets:", error);
    return res.status(500).json({
      message: "Server error while fetching following tweets.",
      success: false,
      error: error.message,
    });
  }
};




export const getUserTweets = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required.",
        success: false,
      });
    }

    const userTweets = await Tweet.find({ userId }) .populate("userId", "name username profilePhoto")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "User's tweets fetched successfully.",
      success: true,
      tweets: userTweets,
    });
  } catch (error) {
    console.error("Error in getUserTweets:", error);
    return res.status(500).json({
      message: "Server error while fetching user's tweets.",
      success: false,
      error: error.message,
    });
  }
};


export const getTweet = async (req, res) => {
  try {
    const tweetId = req.params.id;

    const tweet = await Tweet.findById(tweetId) .populate("userId", "name username profilePhoto")
      .sort({ createdAt: -1 });
    

    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    res.status(200).json({ success: true, tweet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
