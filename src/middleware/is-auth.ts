import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { RequestHandler } from "express";

declare module "jsonwebtoken" {
  export interface UserIDJwtPayload extends jwt.JwtPayload {
    userId: string;
  }
}

dotenv.config();

const isAuth: RequestHandler = (req, _res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      const error = new Error("Not Authorized.");
      error.cause = { code: 401 };
      throw error;
    }
    const token = authHeader.split(" ")[1];
    let decodedToken: jwt.UserIDJwtPayload;
    decodedToken = <jwt.UserIDJwtPayload>(
      jwt.verify(token, process.env.SECRET_KEY as string)
    );
    if (!decodedToken) {
      const error = new Error("Not authenticated.");
      error.cause = { code: 401, message: error.message };
      throw error;
    }
    req.userId = decodedToken.userId;
    next();
  } catch (error: any) {
    error.cause = { code: 500 };
    next(error);
  }
};

export default isAuth;
