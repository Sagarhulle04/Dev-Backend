import express from "express";
import { userAuth } from "../middlewares/userAuth.js";
import { validateEditFieldUpdates } from "../utils/validate.js";
import validator from "validator";
import bcrypt from "bcrypt";

const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.send("ERROR : " + error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditFieldUpdates(req)) {
      throw new Error("Invalid Data Is Not Allowed To Update");
    }

    const user = req.user;
    const skills = req.body.skills;
    const age = req.body.age;

    if (skills.length > 5) {
      throw new Error("Skills should not be greater than 5");
    }

    if (age < 17) {
      throw new Error("Age should be greater than 18");
    }

    Object.keys(req.body).forEach((keys) => (user[keys] = req.body[keys]));

    await user.save();

    res.status(200).json({ message: "Profile Updated", data: user });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    if (!oldPassword || !newPassword) {
      throw new Error("Both old and new passwords are required");
    }

    const user = req.user;

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Password is not Strong");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.send("Password updated successfully");
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

export default profileRouter;
