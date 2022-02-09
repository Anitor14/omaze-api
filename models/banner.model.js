const mongoose = require("mongoose");

const bannerSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    banner_type: {
        type: mongoose.Types.ObjectId,
        ref: "BannerType",
    },
    target: {
      type: String,
      default: "web",
      enum: ["web", "mobile"],
    },
    hasActionButton: {
        type: Boolean,
        default: false
    },
    action: {
        type: String
    },
    title: {
        type: String
    },
    content: {
        type: String
    }
});

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
