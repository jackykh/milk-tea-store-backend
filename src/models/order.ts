import { Schema, model } from "mongoose";

const Order = new Schema(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    orderItems: [
      {
        product: {
          type: Object,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        options: Array<String>,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending for delivery",
    },
    chargeId: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

export default model("Order", Order);
