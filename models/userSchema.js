import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    profilePhoto: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    coverPhoto: {
      type: String,
      default:
        "https://img.freepik.com/free-photo/wavy-black-white-background_23-2150530916.jpg?t=st=1744544903~exp=1744548503~hmac=8d13e407bc78e5fdbefe01ff8a9ec146c3723ec8752cfd4e1110b77964276945&w=1380",
    },
    bio: {
      type: String,
      default: "Hello, I'm using this app!",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    followers: {
      type: Array,
      default: [],
    },
    following: {
      type: Array,
      default: [],
    },
   bookmarks: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Tweet',
}],

  },
  { timestamps: true }
);
export const User = mongoose.model("User", userSchema);
