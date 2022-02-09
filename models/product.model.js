var mongoose = require("mongoose");

var productSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    collections: {
        type: mongoose.Types.ObjectId,
        ref: "Collections"
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: "Category"
    },
    hasVariant: {
        type: Boolean,
        default: false
    },
    variant: [{ type: mongoose.Types.ObjectId, ref: 'ProductVariant' }],
    price: {
        type: Number,
    },
    quantity: {
        type: Number,
    },
    images: [{ type: mongoose.Types.ObjectId, ref: 'Images' }]
},
    { timestamps: true });

productSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.sort("-createdAt");
    next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;