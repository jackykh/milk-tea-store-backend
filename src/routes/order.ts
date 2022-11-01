import express from "express";
import isAuth from "../middleware/is-auth.js";
import { addOrder } from "../controllers/order.js";

const Router = express.Router();

Router.post("/add_order", isAuth, addOrder);

export default Router;
