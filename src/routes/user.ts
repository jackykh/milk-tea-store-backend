import fs from "fs";
import express, { Request } from "express";
import isAuth from "../middleware/is-auth.js";
import { getUserInfo, changeUserInfo, likeItem } from "../controllers/user.js";

import multer, { FileFilterCallback } from "multer";

const router = express.Router();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = "./uploads/avatar";
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: fileStorage, fileFilter });

router.get("/get_userinfo", isAuth, getUserInfo);

router.put("/change_userinfo", isAuth, upload.single("avatar"), changeUserInfo);

router.put("/like_item", isAuth, likeItem);

export default router;
