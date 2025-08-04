import express from "express";
import dotenv from "dotenv";
import databaseConnection from "./config/database.js";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoute.js";
import tweetRoute from "./routes/tweetRoute.js";
import commentRoute from "./routes/commentRoute.js"; 
import cors from "cors";
dotenv.config({
  path: ".env",
});

databaseConnection();
const app = express();


app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: ["http://localhost:5173", "https://twitter-clone-frontend-jet.vercel.app"],
  credentials: true,
};
app.use(cors(corsOptions));


app.use("/api/v1/user", userRoute);
app.use("/api/v1/tweet", tweetRoute);
app.use("/api/v1/tweet/comments", commentRoute);



app.listen(process.env.PORT, () => {
  console.log(`Server listen at ${process.env.PORT}`);
});
