const mongoose = require("mongoose");

const imagesSchema = mongoose.Schema({
    imageableId: {
        type: mongoose.Types.ObjectId
    },
    imageableType: { // The Schema of the imageableId
        type: String
    },
    imagePath: {
        type: String
    },
    imageOptions: {
        type: Object
    },
    created: {
      type: Date,
      default: new Date().toISOString(),
    },
});

const Images = mongoose.model("Images", imagesSchema);

module.exports = Images;
