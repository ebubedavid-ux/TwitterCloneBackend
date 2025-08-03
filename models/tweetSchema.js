import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
  {
    description: {
     type: String,
     required: true
    },
    image: { 
      type: String, 
      default: "" 
    },
    like: { 
      type: Array, 
      default: [] 
    },
   bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],

    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Comment",
      default: [],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  
      required: true,
    },
  },
  { timestamps: true }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
