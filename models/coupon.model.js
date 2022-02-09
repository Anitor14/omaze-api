const mongoose = require("mongoose");

const couponSchema = mongoose.Schema({
    
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;