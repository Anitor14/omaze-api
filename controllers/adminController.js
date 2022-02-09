const mongoose = require("mongoose");

const BannerType = require("../models/banner.type.model");
const Banner = require("../models/banner.model");
const Coupon = require("../models/coupon.model");

const User = require("../models/user.model");

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const Joi = require("joi");
const { StatusCodes } = require("http-status-codes");
const randomstring = require("randomstring");
require("dotenv").config();

/**
 * coupons
 *      - unknown
 */

const createBannerType = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        banner_type: Joi.string(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const { banner_type } = req.body;

        const user = await User.findById(req.user);

        const newBannerType = await BannerType.create({
            banner_type, user: user._id,
        });

        if (!newBannerType) {
            return next(new AppError(`Could not create banner type at this time.`, StatusCodes.BAD_REQUEST));
        }

        res.status(StatusCodes.CREATED).json({
            status: "success",
            banner_type: newBannerType
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const editBannerType = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        banner_type: Joi.string(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const { banner_type } = req.body;
        const { banner_type_id } = req.params;

        const user = await User.findById(req.user);

        const bannerType = await BannerType.findOneAndUpdate(
            { _id: banner_type_id },
            { banner_type: banner_type },
            { new: true }
        );

        if (!bannerType) {
            return next(new AppError(`Could not update banner type at this time.`, StatusCodes.BAD_REQUEST));
        }

        res.status(StatusCodes.OK).json({
            status: "success",
            bannerType
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const viewBannerType = catchAsync(async (req, res, next) => {

    try {

        const { banner_type_id } = req.params;

        let bannerTypes = null;

        if(banner_type_id) {
            bannerTypes = await BannerType.findById(banner_type_id).populate("user");
        }
        else {
            bannerTypes = await BannerType.find().populate("user");
        }

        if (!bannerTypes) {
            return next(new AppError(`Could not find any banner type at this time.`, StatusCodes.BAD_REQUEST));
        }

        res.status(StatusCodes.OK).json({
            status: "success",
            bannerTypes
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const createBanner = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        banner_type: Joi.string().required(),
        hasActionButton: Joi.boolean().required(),
        action: Joi.string().required(),
        title: Joi.string().required(),
        content: Joi.string().required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const { banner_type, hasActionButton, action, title, content } = req.body;

        const user = await User.findById(req.user);
        
        let imageResult = await streamCloudinaryUpload(req);
        const downloadURL = imageResult.secure_url;
        const imageOptions = generateCloudinaryImageOptions(imageResult);

        const newBanner = await Banner.create({
            hasActionButton, action,
            title, content,
            banner_type, user: user._id,
            imagePath: downloadURL,
            imageOptions: imageOptions
        });

        if (!newBanner) {
            return next(new AppError(`Could not create banner at this time.`, StatusCodes.BAD_REQUEST));
        }

        res.status(StatusCodes.CREATED).json({
            status: "success",
            banner_type: newBanner
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const editBanner = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        banner_type: Joi.string().required(),
        hasActionButton: Joi.boolean().required(),
        action: Joi.string().required(),
        title: Joi.string().required(),
        content: Joi.string().required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const { banner_type, hasActionButton, action, title, content } = req.body;
        const { banner_id } = req.params;

        const banner = await Banner.findOneAndUpdate(
            { _id: banner_id },
            {
                hasActionButton: hasActionButton, 
                action: action,
                title: title,
                content: content,
                banner_type: banner_type
            },
            { new: true }
        );

        if (!banner) {
            return next(new AppError(`Could not update banner at this time.`, StatusCodes.BAD_REQUEST));
        }

        res.status(StatusCodes.OK).json({
            status: "success",
            banner
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const viewBanner = catchAsync(async (req, res, next) => {

    try {

        const { banner_id } = req.params;

        let banners = null;

        if(banner_id) {
            banners = await Banner.findById(banner_id).populate("user");
        }
        else {
            banners = await Banner.find().populate("user");
        }

        if (!banners) {
            return next(new AppError(`Could not find any banners at this time.`, StatusCodes.BAD_REQUEST));
        }

        res.status(StatusCodes.OK).json({
            status: "success",
            banners
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

module.exports = {
    createBannerType,
    editBannerType,
    viewBannerType,
    createBanner,
    editBanner,
    viewBanner
};