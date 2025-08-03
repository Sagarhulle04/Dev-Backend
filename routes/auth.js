import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validateSignUpData } from "../utils/validate.js";
import User from "../models/user.js";
import validator from "validator";
import { userAuth } from "../middlewares/userAuth.js";
import { sendVerificationEamil } from "../middlewares/email.js";

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationCode: code,
    });

    await user.save();
    sendVerificationEamil(user.email, code);

    setTimeout(async () => {
      try {
        const existingUser = await User.findById(user._id);
        if (existingUser && !existingUser.isVerified) {
          await User.findByIdAndDelete(user._id);
          console.log(
            `Unverified user ${user.email} will be deleted after 5 minutes`
          );
        }
      } catch (err) {
        console.error("Error deleting unverified user:", err.message);
      }
    }, 1 * 60 * 1000);
    console.log(user);
    return res.status(200).json({ data: user });
  } catch (error) {
    return res.status(404).send(error.message);
  }
});

authRouter.post("/verifyEmail", async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findOne({
      verificationCode: code,
    });
    if (code == user.verificationCode) {
      user.isVerified = true;
      user.verificationCode = null;
      await user.save();
      const token = await user.getJWT();

      // Put the token into the cookie
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 36000000),
      });

      return res.status(200).send("User Verified Successfully");
    }
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(400).send("Invalid Verification Code");
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validator.isEmail(email)) {
      throw new Error("Invalid Credentials");
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).send("Invalid Credentails");
    }

    if (!email || !password) {
      res.status(400).send("Email and Password are required");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      // Get the token

      const token = await user.getJWT();

      // Put the token into the cookie
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 36000000),
      });
    } else {
      return res.status(401).send("Invalid Credentails");
    }
    res.status(200).send(user);
  } catch (error) {
    res.send("ERROR : " + error.message);
  }
});

authRouter.post("/logout", userAuth, async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.status(200).send("Logout Successfully");
});

export default authRouter;
