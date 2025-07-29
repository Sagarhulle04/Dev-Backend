import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://sagarhulle22:sagarhulle22@cluster0.9i6ujzb.mongodb.net/devTinder"
  );
};

export default connectDB;
