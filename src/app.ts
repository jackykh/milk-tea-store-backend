import path from "path";
import express, { Request, Response, NextFunction } from "express";
import { connect } from "mongoose";
import dotenv from "dotenv";
import winston from "winston";
import expressWinston from "express-winston";

dotenv.config();

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import productsRoutes from "./routes/products.js";
import orderRoutes from "./routes/order.js";

const __dirname = path.resolve();

interface Error {
  message?: string;
  cause: {
    code?: number;
  };
}

const app = express();
app.use(express.json()); // application/json

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function (req, res) {
      return false;
    }, // optional: allows to skip some log messages based on request and/or response
  })
);

app.use("/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/products", productsRoutes);

app.use("/admin", adminRoutes);

app.use("/order", orderRoutes);

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  res
    .status(error.cause.code || 400)
    .json({ message: error.message || "Unknown Error" });
});

connect(process.env.MONGODB_STRING as string)
  .then((_result) => {
    app.listen(8080);
    console.log("listen on port 8080.");
  })
  .catch((err) => console.log(err));
