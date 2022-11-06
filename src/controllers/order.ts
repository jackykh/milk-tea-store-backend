import { RequestHandler } from "express";
import Order from "../models/order.js";
import Product from "../models/product.js";
import Stripe from "stripe";

type orderType = Array<{
  productId: string;
  options: string[];
  quantity: number;
}>;

const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: "2022-08-01",
});

export const addOrder: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;

    const items: orderType = req.body.orderItems;
    // const email: string = req.body.email;
    const address: string = req.body.address;

    const products = await Promise.all(
      items.map((item) => {
        return Product.findById(item.productId).select({
          productName: 1,
          engName: 1,
          price: 1,
        });
      })
    );
    if (!products) {
      const error = new Error("Products you ordered are not Found!");
      throw error;
    }
    const orderItems = products.map((product, index) => {
      return {
        product: product,
        quantity: items[index].quantity,
        options: items[index].options,
      };
    });

    const totalPrice = orderItems.reduce((prevValue, value) => {
      if (value.product?.price) {
        return prevValue + value.quantity * value.product.price;
      } else {
        const error = new Error("Total Price counting error");
        throw error;
      }
    }, 0);

    const { cardNumber, exp_month, exp_year, cvc } = req.body.creditCardInfo;
    const token = await stripe.tokens.create({
      card: {
        number: cardNumber,
        exp_month,
        exp_year,
        cvc,
      },
    });

    const charge = await stripe.charges.create({
      amount: totalPrice * 100,
      currency: "hkd",
      source: token.id,
      description: `user-${userId}_order`,
    });

    const order = new Order({
      buyerId: userId,
      orderItems,
      totalPrice,
      address,
      chargeId: charge.id,
    });

    const result = await order.save();

    res.status(200).json({
      message: "成功下單！",
      result: result,
    });
  } catch (error: any) {
    console.log(error);
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};

export const getOrderByUserId: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await Order.find({ buyerId: userId });
    res.status(200).json({
      result: result,
    });
  } catch (error: any) {
    if (!error.cause) {
      error.cause = { code: 500 };
    }
    next(error);
  }
};
