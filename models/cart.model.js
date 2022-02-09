const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    items: {
        type: Array,
    },
    totalQty: {
        type: Number,
    },
    totalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

cartSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.sort("-createdAt");
    next();
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;