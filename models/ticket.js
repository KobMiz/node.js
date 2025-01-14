const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
      match: /^[a-zA-Z0-9\\s]+$/,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["פתוח", "בטיפול", "סגור"],
      default: "פתוח",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.index({ userId: 1, status: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
