import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const signup: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.cause = { code: 422, values: errors.array() };
      throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const hashedPw = await bcrypt.hash(password, 12);
    const result = await new User({
      email: email,
      password: hashedPw,
    }).save();
    const token = jwt.sign(
      {
        email: email,
        userId: result._id.toString(),
      },
      process.env.SECRET_KEY as string,
      {
        expiresIn: "1h",
      }
    );
    res
      .status(201)
      .json({ message: "User created!", userId: result._id, token });
  } catch (error: any) {
    if (!error.cause.code) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    let isEqual;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found");
      error.cause = { code: 401 };
      throw error;
    }
    loadedUser = user;
    if (user.password) {
      isEqual = await bcrypt.compare(password, user.password);
    }
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.cause = { code: 401 };
      throw error;
    }
    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      process.env.SECRET_KEY as string,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ token, userId: loadedUser._id.toString() });
  } catch (error: any) {
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};
