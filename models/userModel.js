const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      first: { type: String, required: true, maxlength: 50 },
      middle: { type: String, default: "", maxlength: 50 },
      last: { type: String, required: true, maxlength: 50 },
    },
    isAdmin: { type: Boolean, default: false },
    isBusiness: { type: Boolean, default: false },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date }, 
    address: {
      state: { type: String, default: "" },
      country: { type: String, required: true, maxlength: 50 },
      city: { type: String, required: true, maxlength: 50 },
      street: { type: String, required: true, maxlength: 100 },
      houseNumber: { type: Number, required: true, min: 1 },
    },
    image: {
      url: { type: String, default: "https://example.com/default-profile.jpg" },
      alt: { type: String, default: "Default user profile image" },
    },
  },
  { timestamps: true }
);

userSchema.index({ isAdmin: 1 });
userSchema.index({ isBusiness: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
