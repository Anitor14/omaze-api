const mongoose = require("mongoose");

const bannerTypeSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    banner_type: {
        type: String,
    },
});

const BannerType = mongoose.model("BannerType", bannerTypeSchema);

module.exports = BannerType;
