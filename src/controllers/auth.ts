import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { randomBytes } from "crypto";
import { promisify } from "util";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import sgMail from "@sendgrid/mail";

const randomBytesAsync = promisify(randomBytes);

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

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
    const msg = {
      to: email, // Change to your recipient
      from: "jackycheungtester@gmail.com", // Change to your verified sender
      subject: "歡迎成為本店會員！",
      html: "<strong>歡迎成為本店會員，閣下以後可以本帳號享受本店的各種優惠！</strong>",
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

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
    let isEqual: boolean = false;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found");
      error.cause = { code: 401 };
      throw error;
    }
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
        email: user.email,
        userId: user._id.toString(),
      },
      process.env.SECRET_KEY as string,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ token, userId: user._id.toString() });
  } catch (error: any) {
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};

export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const oldPassword = req.body.oldPassword;
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.cause = { code: 401 };
      throw error;
    }
    let isEqual: boolean = false;
    if (user.password) {
      isEqual = await bcrypt.compare(oldPassword, user.password);
    }
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.cause = { code: 401 };
      throw error;
    }

    user.password = await bcrypt.hash(req.body.newPassword, 12);
    await user.save();
    res.status(200).json({ message: "Sucessfully Update Password!" });
  } catch (error: any) {
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};

export const sendResetEmail: RequestHandler = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found");
      error.cause = { code: 401 };
      throw error;
    }
    const buffer = await randomBytesAsync(32);
    const token = buffer.toString("hex");
    user.resetToken = token;
    user.resetTokenExpiration = new Date(Date.now() + 3600000);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
    const msg = {
      to: email, // Change to your recipient
      from: "jackycheungtester@gmail.com", // Change to your verified sender
      subject: "重設密碼提示",
      html: `<p>親愛的${user.lastName}先生/小姐</p><p>我們已收到你重設密碼的指示，請按<a href="${process.env.CLIENT}/reset_password/a/${token}">此連結<a>重設密碼。</p>`,
    };
    await Promise.all([user.save(), sgMail.send(msg)]);
    res.status(200).json({ message: "重設密碼電郵已發出！" });
  } catch (error: any) {
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};

export const postNewPassword: RequestHandler = async (req, res, next) => {
  try {
    const { passwordToken, newPassword } = req.body;
    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      const error = new Error("電郵不正確或此連結不正確。");
      throw error;
    }
    const password = await bcrypt.hash(newPassword, 12);
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.status(200).json({ message: "密碼已更新！" });
  } catch (error: any) {
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};
