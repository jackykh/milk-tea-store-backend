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
  lastName: {
    type: String,
    default: "",
  },
  phoneNumber: {
    type: String,
    default: "",
  },
  group: {
    type: String,
    default: "user",
  },
  avatar: {
    type: String,
    default: "images/avatar/defaultIcon.png",
  },
});

export default model("User", userSchema);
