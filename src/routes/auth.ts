import express from "express";
import { body } from "express-validator";

import User from "../models/user.js";
import { signup, login } from "../controllers/auth.js";

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

export default router;
