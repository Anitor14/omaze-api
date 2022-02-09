const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

favoriteSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.sort("-createdAt");
    next();
});

const Favorites = mongoose.model("Favorites", favoriteSchema);

module.exports = Favorites;