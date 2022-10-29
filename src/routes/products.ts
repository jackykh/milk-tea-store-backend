import express from "express";
import { getProduct, getProducts } from "../controllers/products.js";

const router = express.Router();

router.get("/get_product/:productId", getProduct);

router.get("/get_products", getProducts);

export default router;
