import express from "express";
import { userAuth } from "../middlewares/userAuth.js";
import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js";

const userRouter = express.Router();

userRouter.get("/user/request/received", userAuth, async (req, res) => {
  const loggedIn = req.user;

  const connectionRequest = await ConnectionRequest.find({
    toUserId: loggedIn._id,
    status: "intrested",
  }).populate(
    "fromUserId",
    "firstName lastName photoURL about gender age skills"
  );

  res.status(200).json({
    message: "Your all received request",
    data: connectionRequest,
  });
});

userRouter.get("/user/connection", userAuth, async (req, res) => {
  const loggedInUser = req.user;

  const connections = await ConnectionRequest.find({
    $or: [
      { toUserId: loggedInUser._id, status: "accepted" },
      { fromUserId: loggedInUser._id, status: "accepted" },
    ],
  })
    .populate(
      "fromUserId",
      "firstName lastName age gender skills about photoURL"
    )
    .populate(
      "toUserId",
      "firstName lastName age gender skills about photoURL"
    );

  const data = connections.map((conn) => {
    // If the logged-in user is the fromUser, return the toUser's info, else return fromUser's info
    if (conn.fromUserId._id.toString() === loggedInUser._id.toString()) {
      return conn.toUserId;
    }
    return conn.fromUserId;
  });

  res.status(200).json({ message: "Your Connections", data });
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  const loggedIn = req.user._id;

  const allRequests = await ConnectionRequest.find({
    $or: [{ fromUserId: loggedIn }, { toUserId: loggedIn }],
  });

  const excludedUserIds = new Set();
  allRequests.forEach((req) => {
    excludedUserIds.add(req.fromUserId.toString());
    excludedUserIds.add(req.toUserId.toString());
  });

  excludedUserIds.add(loggedIn.toString());

  const users = await User.find({
    _id: { $nin: Array.from(excludedUserIds) },
  });

  res.status(200).json(users);
});

export default userRouter;
