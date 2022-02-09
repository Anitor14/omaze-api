var mongoose = require("mongoose");

var collectionSchema = mongoose.Schema({
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
    images: [{ type: mongoose.Types.ObjectId, ref: 'Images' }],
    isDefault: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true });

collectionSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.sort("-createdAt");
    next();
});

const Collections = mongoose.model("Collections", collectionSchema);

module.exports = Collections;