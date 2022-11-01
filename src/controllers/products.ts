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
    let order = "price";
    const orderOptions = ["price", "likes"];
    if (orderOptions.includes(req.query.order as string)) {
      order = req.query.order as string;
    }

    const searchOption = req.query.search
      ? { productName: { $regex: req.query.search } }
      : {};

    const result = await Promise.all([
      Product.find(searchOption).countDocuments(),
      Product.find(searchOption)
        .sort({ [order]: -1 })
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage),
    ]);

    const adjustedItems = result[1].map((item) => {
      return {
        id: item._id,
        name: item.productName,
        price: item.price,
        photo: item.photos[0],
      };
    });
    res.status(200).json({
      products: adjustedItems,
      totalItems: result[0],
    });
  } catch (error: any) {
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};
