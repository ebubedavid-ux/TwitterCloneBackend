import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({
  path: "../.env",
});
const databaseConnection = () => {
  console.log("MONGO_URI:", process.env.MONGO_URI);

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to mongoDB");
    })
    .catch((err) => {
      console.log(err);
    });
};
export default databaseConnection;
