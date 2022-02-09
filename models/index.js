const AddressModel = require("./address.model");
const BannerModel = require("./banner.model");
const BannerTypeModel = require("./banner.type.model");
const CartModel = require("./cart.model");
const CategoryModel = require("./category.model");
const CollectionsModel = require("./collection.model");
const CountryCityModel = require("./country.city.model");
const CouponModel = require("./coupon.model");
const ProductModel = require("./product.model");
const FavouritesModel = require("./favourites.model");
const UserModel = require("./user.model");
const TransactionModel = require("./transaction.model");
const ImagesModel = require("./images.model");

module.exports = { 
    AddressModel, BannerModel, BannerTypeModel, CartModel, 
    CategoryModel, CollectionsModel, CountryCityModel, CouponModel,
    ProductModel, FavouritesModel, UserModel, TransactionModel, ImagesModel
};

