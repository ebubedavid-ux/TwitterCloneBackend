import { User } from "../models/userSchema.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";




export const Register = async (req, res) => {
  try {
    const {name, username, email, password, profilePhoto} = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required.',
        success: false,
      });
    }

    const user = await User.findOne({email});

    if(user){
      return res.status(400).json({
        message: 'This user already exists',
        success: false,
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    const newUser = await User.create({
      name, 
      username, 
      email, 
      password: hashedPassword, 
      profilePhoto
    });

    return res.status(201).json({
      message: 'Account created successfully',
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
};


export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "User does not exist",
        success: false,
      });
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const tokenData = {
      userId: user._id,
    };
    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .json({
        message: `Welcome back ${user.name}`,
        user,
        success: true,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const Logout = async (req,res) => {
  return res.cookie('token', '', {expiresIn: new Date(Date.now()) }).json({
    message: 'User logged out successfuly',
    success: true,
  });
}

export const bookmark = async (req,res) => {
  try {
    const loggedInUserId= req.body.id;
    const tweetId = req.params.id;
    
    const user = await User.findById(loggedInUserId);

    if(user.bookmarks.includes(tweetId)){
      await user.findByIdAndUpdate(loggedInUserId, {
        $pull: {bookmarks: tweetId},
      });

      return res.status(200).json({
        message: 'Removed from bookmarks'
      });
    } else {
      await user.findByIdAndUpdate(loggedInUserId, {
        $push: {bookmark: tweetId},
      });

      return res.status(200).json({
        message: 'Saved to bookmarks'
      });
    }
  } catch (error) {
     console.log(error);
  }
}

export const getMyProfile = async (req,res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id).select('-password');

    return res.status(200).json({
      user,
    })
  } catch (error) {
      console.log(error);
  }
}

export const getOtherUsers = async (req,res) => {
  try {
    const {id} = req.params

    const otherUsers = await User.find({_id: {$ne: id} }).select('-password');

    if(!otherUsers){
      return res.status(401).json({
        message: 'Currently do not have any users',
      })
    }

    return res.status(200).json({
      otherUsers,
    })
  } catch (error) {
    console.log(error)
  }
}
export const follow = async (req, res) => {
  try {
    const loggedInUserId = req.body.id;
    const userId = req.params.id;

    const loggedInUser = await User.findById(loggedInUserId);
    const user = await User.findById(userId);

    if (!user.followers.includes(loggedInUserId)) {
      await user.updateOne({ $push: { followers: loggedInUserId } });
      await loggedInUser.updateOne({ $push: { following: userId } });
    } else {
      return res.status(400).json({
        message: `User already followed ${user.username}`,
      });
    }


    const updatedUser = await User.findById(userId);

    return res.status(200).json({
      message: `${loggedInUser.username} just followed ${user.username}`,
      success: true,
      user: updatedUser, 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const unfollow = async (req, res) => {
  try {
    const loggedInUserId = req.body.id;
    const userId = req.params.id;

    const loggedInUser = await User.findById(loggedInUserId);
    const user = await User.findById(userId);

    if (loggedInUser.following.includes(userId)) {
      await user.updateOne({ $pull: { followers: loggedInUserId } });
      await loggedInUser.updateOne({ $pull: { following: userId } });
    } else {
      return res.status(400).json({
        message: `You are not following ${user.username}`,
      });
    }

   
    const updatedUser = await User.findById(userId);

    return res.status(200).json({
      message: `${loggedInUser.username} unfollowed ${user.username}`,
      success: true,
      user: updatedUser, 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params; 
    const { name, username, bio, profilePhoto, coverPhoto } = req.body; 

    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    
    if (name) user.name = name;
    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (profilePhoto) user.profilePhoto = profilePhoto;
    if (coverPhoto) user.coverPhoto = coverPhoto;

    
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully.",
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return res.status(500).json({
      message: "Server error while updating profile.",
      success: false,
      error: error.message,
    });
  }
};


export const searchUsers = async (req, res) => {
  try {

    const searchTerm = req.query.q;


    if (!searchTerm) {
      return res.status(400).json({
        message: "Please enter a search term.",
        success: false,
      });
    }


    const foundUsers = await User.find({
      username: { $regex: searchTerm, $options: "i" },
    }).select("-password");

   
    res.status(200).json({
      success: true,
      users: foundUsers,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      message: "Something went wrong while searching.",
      success: false,
    });
  }
};
