import express from "express";
import mongoose from "mongoose";
import { userAuth } from "../middlewares/userAuth.js";
import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js";

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignore", "intrested"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type: " + status });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found!" });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection Request Already Exists!!" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const toUserId = req.user._id;
      const fromUserId = req.params.requestId;
      const status = req.params.status;

      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid Request Type");
      }

      const fromUser = await User.findById(fromUserId);
      if (!fromUser) {
        return res.send("User not found");
      }

      if (fromUserId == toUserId) {
        throw new Error("You cannot send request to yourself");
      }

      const connectionRequest = await ConnectionRequest.findOne({
        fromUserId,
        toUserId,
        status: "intrested",
      });
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection Request Not Found" });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      res.status(200).json({ message: `Connection Request ${status}`, data });
    } catch (err) {
      res.status(400).send("ERROR : " + err.message);
    }
  }
);

export default requestRouter;
