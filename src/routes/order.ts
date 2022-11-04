import express from "express";
import isAuth from "../middleware/is-auth.js";
import { addOrder, getOrderByUserId } from "../controllers/order.js";

const Router = express.Router();

Router.post("/add_order", isAuth, addOrder);
Router.get("/get_orders", isAuth, getOrderByUserId);

export default Router;
