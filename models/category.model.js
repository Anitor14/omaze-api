var mongoose = require("mongoose");

var categorySchema = mongoose.Schema({
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
    images: [{ type: mongoose.Types.ObjectId, ref: 'Images' }],
    isDefault: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true });

categorySchema.pre(/^find/, function (next) {
    // this points to the current query
    this.sort("-createdAt");
    next();
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;