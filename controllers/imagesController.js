const Collections = require("../models/collection.model");
const Category = require("../models/category.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const Joi = require("joi");
const { StatusCodes } = require("http-status-codes");

const addProductImages = catchAsync(async (req, res, next) => {
    
    try {

        const { product_id } = req.params;

        const product = await Product.findOneAndUpdate(
            { _id: product_id },
            { },
            { new: true }
        );

        if (!product) {
            return next(new AppError(`Could not update product at this time.`, StatusCodes.BAD_REQUEST));
        }

        res.status(StatusCodes.OK).json({
            message: "Product updated successfully",
            status: "success",
            product
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }
});

const addCollectionImages = catchAsync(async (req, res, next) => {
    
});

const addCategoryImages = catchAsync(async (req, res, next) => {
    
});

module.exports = {
    addProductImages,
    addCollectionImages,
    addCategoryImages
};