import fs from "fs";
import { RequestHandler } from "express";
import Product from "../models/product.js";
import User from "../models/user.js";

export const addProduct: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const isAdmin = user?.group === "admin";
    if (!isAdmin) {
      const error = new Error("Not Authorized");
      error.cause = { code: 401 };
      throw error;
    }
    const { productName, description, price, engName } = JSON.parse(
      req.body.productInfo
    );
    let fileArray: any;
    if (req.files) {
      const myfiles = JSON.parse(JSON.stringify(req.files));
      fileArray = myfiles.map((file: any) => file.path);
    }

    const result = await new Product({
      productName,
      description,
      price,
      engName,
      photos: fileArray,
    }).save();
    res.status(200).json({ message: "Sucessfully added!", result: result });
  } catch (error: any) {
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};

export const editProduct: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const isAdmin = user?.group === "admin";
    if (!isAdmin) {
      const error = new Error("Not Authenticated");
      error.cause = { code: 401 };
      throw error;
    }
    const { id, description, price } = JSON.parse(req.body.productInfo);
    let fileArray: any;
    if (req.files) {
      const myfiles = JSON.parse(JSON.stringify(req.files));
      fileArray = myfiles.map((file: any) => file.path);
    }
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error("No product found");
      error.cause = { code: 404 };
      throw error;
    }
    product.description = description;
    product.price = price;
    if (fileArray) {
      product.photos = fileArray;
    }
    const result = await product.save();
    res.status(200).json({ message: "Updated sucessfully!", product: result });
  } catch (error: any) {
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};

export const deleteProduct: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const isAdmin = user?.group === "admin";
    if (!isAdmin) {
      const error = new Error("Not Authorized");
      error.cause = { code: 401 };
      throw error;
    }
    const product = await Product.findById(req.body.productId);
    if (product) {
      const adjustedName = (product.engName as string).replace(/\s+/g, "_");
      const path = `./images/products/${adjustedName}`;
      fs.rmSync(path, { recursive: true, force: true });
      const result = await product.remove();
      res.status(200).json({ message: "Remove sucessfully", result });
    } else {
      const error = new Error("Product Not Found");
      error.cause = { code: 404 };
      throw error;
    }
  } catch (error: any) {
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};
