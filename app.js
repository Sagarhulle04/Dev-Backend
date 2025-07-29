import express from "express";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import { userAuth } from "./middlewares/userAuth.js";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import userRouter from "./routes/user.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Importing Models
import User from "./models/user.js";
import requestRouter from "./routes/request.js";
import ConnectionRequest from "./models/connectionRequest.js";

// routes
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

app.get("/user", userAuth, async (req, res) => {
  try {
    const userEmail = req.body.email;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (error) {
    res.status(400).send("Something went wrong: " + error.message);
  }
});

connectDB()
  .then(() => {
    console.log("Mongodb connected successfully");
    app.listen(80, "0.0.0.0", () => {
      console.log("Server Running on port 3000");
    });
  })
  .catch((err) => {
    console.log("Error Occured in MongoDB", err);
  });
