const
    { AddressModel, CategoryModel, CollectionsModel,
        BannerModel, ProductModel, BannerTypeModel, CouponModel,
        CountryCityModel, FavouritesModel, UserModel,
        TransactionModel, ImagesModel }
        = require('../models/index');

const determineModel = (name) => {

    let model = null;

    switch (name) {
        case "category":
            model = CategoryModel;
            break;
        case "product":
            model = ProductModel;
            break;
        case "collection":
            model = CollectionsModel;
            break;
        case "banner":
            model = BannerModel;
            break;
        case "address":
            model = AddressModel;
            break;
        case "user":
            model = UserModel;
            break;
        case "coupon":
            model = CouponModel;
            break;
        case "favourites":
            model = FavouritesModel;
            break;
        case "country":
            model = CountryCityModel;
        case "transaction":
            model = TransactionModel;
        default:
            break;
    }

    return model;
}

const determineUploadPath = (name) => {
    let path = null;
    switch (name) {
        case "category":
            path = "images/category";
            break;
        case "product":
            path = "images/products";
            break;
        case "collections":
            path = "images/collections";
            break;
        case "productvariant":
            path = "images/products/variant";
            break;
        default:
            break;
    }
    return path;
}

const updateImageToModel = async (model, imageableId, imageableType, imageOptions) => {

    const currentImage = await ImagesModel.create({
        imageableId,
        imageableType,
        imageOptions,
        imagePath: null,
    });

    await model.findOne({ _id: imageableId }).exec(function (err, nitem) {
        nitem.images.push(currentImage._id);
        nitem.save(function (err) { });
    });

}

module.exports = {
    determineModel, updateImageToModel, determineUploadPath
}