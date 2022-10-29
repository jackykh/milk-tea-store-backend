import express, { Request } from "express";
import isAuth from "../middleware/is-auth.js";
import fs from "fs";
import {
  addProduct,
  deleteProduct,
  editProduct,
} from "../controllers/admin.js";
import multer, { FileFilterCallback } from "multer";

const router = express.Router();

const fileStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const { engName } = JSON.parse(req.body.productInfo);
    const adjustedName = (engName as String).replace(/\s+/g, "_");
    const path = `./images/products/${adjustedName}`;
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    } else {
      fs.readdirSync(path).forEach((file) => {
        fs.unlink(`${path}/${file}`, (error) => {
          if (error) {
            console.log(error);
          }
        });
      });
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

router.put("/add_product", upload.array("images", 4), isAuth, addProduct);

router.patch("/edit_product", upload.array("images", 4), isAuth, editProduct);

router.delete("/delete_product", isAuth, deleteProduct);

export default router;
