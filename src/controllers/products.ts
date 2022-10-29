import { RequestHandler } from "express";
import Product from "../models/product.js";

export const getProduct: RequestHandler = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("No product found");
      error.cause = { code: 404 };
      throw error;
    }
    res.status(200).json({ product: product });
  } catch (error: any) {
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};

export const getProducts: RequestHandler = async (req, res, next) => {
  try {
    let currentPage: number = 1;
    if (req.query.page) {
      currentPage = +req.query.page || 1;
    }
    const itemsPerPage = 6;
    const totalItems = await Product.find().countDocuments();
    const items = await Product.find()
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage);
    const adjustedItems = items.map((item) => {
      return {
        id: item._id,
        name: item.productName,
        price: item.price,
        photo: item.photos[0],
      };
    });
    res.status(200).json({
      products: adjustedItems,
      totalItems,
    });
  } catch (error: any) {
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};
