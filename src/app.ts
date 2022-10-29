import path from "path";
import express, { Request, Response, NextFunction } from "express";
import { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import productsRoutes from "./routes/products.js";
const __dirname = path.resolve();

interface Error {
  message?: string;
  cause: {
    code?: number;
  };
}

const app = express();
app.use(express.json()); // application/json

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/products", productsRoutes);

app.use("/admin", adminRoutes);

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  res
    .status(error.cause.code || 400)
    .json({ message: error.message || "Unknown Error" });
});

connect(process.env.MONGODB_STRING as string)
  .then((_result) => app.listen(8080))
  .catch((err) => console.log(err));
