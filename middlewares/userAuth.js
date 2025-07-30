import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).send("Please Re-Login");
    }

    const decodedMessage = await jwt.verify(token, "SagarHulle04");
    const { _id } = decodedMessage;

    const user = await User.findById(_id);
    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
};
