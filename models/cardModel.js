const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, minlength: 3, maxlength: 100 },
    subtitle: { type: String, maxlength: 100 },
    description: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1000,
    },
    phone: { type: String, required: true, minlength: 10, maxlength: 15 },
    email: { type: String, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    web: { type: String, match: /^(https?:\/\/).+/ },
    image: {
      url: { type: String },
      alt: { type: String },
    },
    address: {
      state: { type: String, maxlength: 50 },
      country: { type: String, required: true, maxlength: 50 },
      city: { type: String, required: true, maxlength: 50 },
      street: { type: String, required: true, maxlength: 50 },
      houseNumber: { type: Number, required: true, min: 1, max: 10000 },
      zip: { type: Number, min: 1000, max: 99999 },
    },
    bizNumber: { type: Number, unique: true, required: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

cardSchema.pre("save", async function (next) {
  if (!this.bizNumber) {
    console.log("Generating bizNumber for new card..."); 
    const count = await mongoose.model("Card").countDocuments();
    this.bizNumber = 1000000 + count + 1;
    console.log("Generated bizNumber:", this.bizNumber); 
  }
  next();
});

cardSchema.pre("findOneAndUpdate", async function (next) {
  const { bizNumber } = this._update;
  if (bizNumber) {
    const existingCard = await mongoose.model("Card").findOne({ bizNumber });
    if (existingCard) {
      return next(new Error("bizNumber already taken by another business"));
    }
  }
  next();
});


const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
