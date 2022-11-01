import express from "express";
import { body } from "express-validator";

import User from "../models/user.js";
import {
  signup,
  login,
  changePassword,
  sendResetEmail,
  postNewPassword,
} from "../controllers/auth.js";
import isAuth from "../middleware/is-auth.js";

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom(async (value) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject("E-Mail address already exists!");
        }
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 8 }),
  ],
  signup
);

router.post("/login", login);

router.patch("/change_password", isAuth, changePassword);

router.post("/send_reset_email", sendResetEmail);

router.patch("/reset_password", postNewPassword);

export default router;
