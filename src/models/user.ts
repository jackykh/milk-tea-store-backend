import { Schema, model } from "mongoose";

const userSchema = new Schema({
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  firstName: {
    type: String,
    default: "用戶",
  },
  lastName: String,
  phoneNumber: String,
  group: {
    type: String,
    default: "user",
  },
  likeItems: {
    type: Array<String>,
    default: [],
  },
  resetToken: String,
  resetTokenExpiration: Date,
  avatar: {
    type: String,
    default: "images/avatar/defaultIcon.png",
  },
});

export default model("User", userSchema);
