import mongoose from "mongoose";


const commentSchema = new mongoose.Schema({
  tweetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Tweet", required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});
export const Comment = mongoose.model("Comment", commentSchema);
