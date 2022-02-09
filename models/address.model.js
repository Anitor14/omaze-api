const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "There is no user tied to this transaction, login and try again"],
    },
    postcode: {
        type: String,
    },
    address: {
        type: String,
        required: [true, "Address is Required"],
    },
    is_default: {
        type: Boolean,
        default: false,
    }
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
