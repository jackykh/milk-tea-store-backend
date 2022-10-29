import { Schema, model } from "mongoose";

const productSchema = new Schema({
  productName: {
    type: String,
    require: true,
  },
  engName: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  photos: [
    {
      type: String,
      default: "images/products/milktea.png",
    },
  ],
});

export default model("Products", productSchema);
