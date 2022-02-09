const mongoose = require("mongoose");

const countryCitySchema = new mongoose.Schema({
    country: {
        type: String,
        required: true,
    },
    data: {
        type: Object,
    }
});

countryCitySchema.pre(/^find/, function (next) {
    // this points to the current query
    this.sort("-createdAt");
    next();
});

const CountryCity = mongoose.model("CountryCity", countryCitySchema);

module.exports = CountryCity;