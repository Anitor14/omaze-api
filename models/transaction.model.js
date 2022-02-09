const mongoose = require("mongoose");

const purchasedItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
  },
  variant_id: {
    type: mongoose.Types.ObjectId,
    ref: "ProductVariant",
  },
  quantity: {
    type: Number,
  }
});

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  userTransRef: {
    type: String,
    required: true
  },
  transRef: {
    type: String,
    required: false
  },
  transType: {
    type: String,
    default: "cash",
    enum: ["flutterwave", "paystack", "cash"],
  },
  email: {
    type: String,
    required: false
  },
  items: [purchasedItemSchema],
  amount: {
    type: Number,
    min: 10,
    required: true,
  },
  address: {
    type: mongoose.Schema.ObjectId,
    ref: "Address",
  },
  checkout_information: {
    type: Object,
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "failed", "successful", "cancelled"],
  },
  payment_status: {
    type: String,
    default: "unpaid",
    enum: ["paid", "unpaid"]
  },
},
  { timestamps: true }
);

transactionSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.sort("-createdAt");
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;