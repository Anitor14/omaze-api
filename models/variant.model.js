var mongoose = require("mongoose");

var productVariantSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Types.ObjectId,
        ref: "Product"
    },
    variant_type: {
        type: String,
        default: "size",
        enum: ["size", "color"],
    },
    variant_value: {
        type: String,
    },
    description: {
        type: String,
    },
    quantity: {
        type: Number,
    },
    price: {
        type: Number,
    },
    images: [{ type: mongoose.Types.ObjectId, ref: 'Images' }]

}, { timestamps: true } );

productVariantSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.sort("-createdAt");
    next();
});

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);
module.exports = ProductVariant;