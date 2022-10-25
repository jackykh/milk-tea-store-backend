import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import User from "../models/user.js";

export const getUserInfo: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.cause = { code: 401 };
      throw error;
    }
    const { email, firstName, lastName, phoneNumber, avatar } = user;
    const userInfo = {
      email,
      firstName,
      lastName,
      phoneNumber,
      avatar,
    };
    res.status(200).json(userInfo);
  } catch (error: any) {
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};

export const changeUserInfo: RequestHandler = async (req, res, next) => {
  try {
    const { email, firstName, lastName, phoneNumber, avatar } = JSON.parse(
      req.body.userInfo
    );
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.cause = { code: 401 };
      throw error;
    }
    let imageUrl = avatar;
    if (req.file) {
      imageUrl = req.file.path;
      const oldUrl = path.join(path.resolve(), avatar);
      fs.unlink(oldUrl, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.phoneNumber = phoneNumber;
    user.avatar = imageUrl;
    const result = await user.save();
    res.status(200).json({ message: "User updated!", updatedUserInfo: result });
  } catch (error: any) {
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};
