const mongoose = require("mongoose");

const Cart = require("../models/cart.model");
const Favorites = require("../models/favourites.model");
const Transaction = require("../models/transaction.model");
const Product = require("../models/product.model");
const ProductVariant = require("../models/variant.model");
const User = require("../models/user.model");
const Address = require("../models/address.model");

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const Joi = require("joi");
const { StatusCodes } = require("http-status-codes");
const randomstring = require("randomstring");
require("dotenv").config();

const prePurchase = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        transType: Joi.string().valid("flutterwave", "paystack", "cash").required(),
        items: Joi.array(),
        amount: Joi.number(),
        checkout_information: Joi.object(),
    });

    /* const preItem = [
        { product_id: "", variant_id: "", quantity: 1 },
        { product_id: "", variant_id: "", quantity: 3 },
        { product_id: "", variant_id: "", quantity: 19 }
    ] */

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const userTransRef = `${process.env.RANDOM_SECRET}-${randomstring.generate(7)}`;

        const { transType, items, amount, email, checkout_information } = req.body;

        const newTransaction = await Transaction.create({
            userTransRef, transType, amount,
            email, checkout_information
        });

        items.map((single_item) => {
            Transaction.findOne({ _id: newTransaction._id }).exec(function (err, nitem) {
                nitem.items.push(single_item);
                nitem.save(function (err) { });
            });
        });

        if (!newTransaction) {
            return next(new AppError(`Could start purchase at this time.`, StatusCodes.BAD_REQUEST));
        }

        res.status(StatusCodes.CREATED).json({
            status: "success",
            transaction: newTransaction
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const postPurchase = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        transRef: Joi.string().required(),
        userTransRef: Joi.string().required(),
        status: Joi.string().required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const { email, transRef, userTransRef, status } = req.body;

        const transaction = await Transaction.findOne({ userTransRef: userTransRef, email: email });

        transaction.transRef = transRef;
        transaction.status = status;
        transaction.payment_status = "paid";

        await transaction.save();

        transaction.items.map((trans_items) => {

            const updateProduct =  Product.findById(trans_items.product_id);

            if (updateProduct.hasVariant) {
                const updateProductVariant =  ProductVariant.findById(trans_items.variant_id);
                updateProductVariant.quantity -= trans_items.quantity;
                updateProductVariant.save();
            }
            else {
                updateProduct.quantity -= trans_items.quantity;
                updateProduct.save();
            }

        });

        res.status(StatusCodes.OK).json({
            status: "success",
            transaction
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

// authenticated users

const addNewAddress = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        postcode: Joi.string(),
        address: Joi.string().required(),
        is_default: Joi.boolean(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const user = await User.findById(req.user);

        const { postcode, address, is_default } = req.body;

        if (is_default) {
            const existingAddress = await Address.findOne({ is_default: true, user: user._id });
            if (existingAddress) {
                existingAddress.is_default = false;
                await existingAddress.save();
            }
        }

        const userNewAddress = new Address({
            postcode: postcode,
            address: address,
            is_default: is_default
        });

        await userNewAddress.save();

        res.status(StatusCodes.CREATED).json({
            status: "success",
            address: userNewAddress
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const editUserAddress = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        postcode: Joi.string(),
        address: Joi.string().required(),
        is_default: Joi.boolean(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const user = await User.findById(req.user);

        const { address_id } = req.params;

        const { postcode, address, is_default } = req.body;

        if (is_default) {
            const existingAddress = await Address.findOne({ is_default: true, user: user._id });
            if (existingAddress) {
                existingAddress.is_default = false;
                await existingAddress.save();
            }
        }

        const updatedAddress = await Address.findOneAndUpdate(
            { _id: address_id },
            { postcode: postcode, address: address, is_default: is_default },
            { new: true }
        );

        res.status(StatusCodes.CREATED).json({
            status: "success",
            address: updatedAddress
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const myUserAddresses = catchAsync(async (req, res, next) => {

    try {

        const user = await User.findById(req.user);

        const myAddresses = await Address.find({ user: user._id });

        res.status(StatusCodes.CREATED).json({
            status: "success",
            address: myAddresses
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const prePurchaseAuth = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        transType: Joi.string().valid("flutterwave", "paystack", "cash").required(),
        items: Joi.array(),
        amount: Joi.number(),
        address: Joi.string().required(),
        checkout_information: Joi.object(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const user = await User.findById(req.user);

        const userTransRef = `${process.env.RANDOM_SECRET}-${randomstring.generate(7)}`;

        const { transType, items, amount, address, checkout_information } = req.body;

        const newTransaction = await Transaction.create({
            userTransRef, transType, amount,
            address, checkout_information,
            user: user._id
        });

        items.map((single_item) => {
            Transaction.findOne({ _id: newTransaction._id }).exec(function (err, nitem) {
                nitem.items.push(single_item);
                nitem.save(function (err) { });
            });
        });

        if (!newTransaction) {
            return next(new AppError(`Could start purchase at this time.`, StatusCodes.BAD_REQUEST));
        }

        res.status(StatusCodes.CREATED).json({
            status: "success",
            transaction: newTransaction
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const postPurchaseAuth = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        transRef: Joi.string().required(),
        userTransRef: Joi.string().required(),
        status: Joi.string().required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const user = await User.findById(req.user);

        const { transRef, userTransRef, status } = req.body;

        const transaction = await Transaction.findOne({ userTransRef: userTransRef, user: user._id });

        transaction.transRef = transRef;
        transaction.status = status;
        transaction.payment_status = "paid";

        await transaction.save();

        transaction.items.map((trans_items) => {

            const updateProduct =  Product.findById(trans_items.product_id);

            if (updateProduct.hasVariant) {
                const updateProductVariant =  ProductVariant.findById(trans_items.variant_id);
                updateProductVariant.quantity -= trans_items.quantity;
                updateProductVariant.save();
            }
            else {
                updateProduct.quantity -= trans_items.quantity;
                updateProduct.save();
            }

        });

        /* const transaction = await Transaction.findOneAndUpdate(
            { userTransRef: userTransRef, user: user._id },
            { transRef: transRef, status: status, payment_status: "paid" },
            { new: true }
        ); */

        if (!transaction) {
            return next(new AppError(`Could update your transaction.`, StatusCodes.BAD_REQUEST));
        }

        res.status(StatusCodes.OK).json({
            status: "success",
            transaction
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const addToCart = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        items: Joi.array().required(),
        totalQty: Joi.number().required(),
        totalPrice: Joi.number().required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const user = await User.findById(req.user);

        const { items, totalQty, totalPrice } = req.body;

        let cart = null;

        const check_cart = await Cart.find({ user: user._id });

        if (check_cart) {
            cart = await Cart.findOneAndUpdate(
                { user: user._id },
                { items: items, totalQty: totalQty, totalPrice: totalPrice },
                { new: true }
            );
        }
        else {
            cart = await Cart.create({
                items, totalQty,
                totalPrice, user: user._id
            });
        }

        if (!cart) {
            return next(new AppError(`Could add items to cart.`, StatusCodes.BAD_REQUEST));
        }

        res.status(StatusCodes.CREATED).json({
            status: "success",
            cart
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const updateCart = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        items: Joi.array().required(),
        totalQty: Joi.number().required(),
        totalPrice: Joi.number().required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const user = await User.findById(req.user);

        const { items, totalQty, totalPrice } = req.body;

        const cart = await Cart.findOneAndUpdate(
            { user: user._id },
            { items: items, totalQty: totalQty, totalPrice: totalPrice },
            { new: true }
        );

        if (!cart) {
            return next(new AppError(`Could update items on cart.`, StatusCodes.BAD_REQUEST));
        }

        res.status(StatusCodes.OK).json({
            status: "success",
            cart
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const clearCart = catchAsync(async (req, res, next) => {

    try {

        const user = await User.findById(req.user);

        await Cart.findOneAndRemove({ user: user._id }, function (err, record) {
            if (!err) {
                res.status(StatusCodes.OK).json({
                    status: "success",
                    record
                });
            }
            return next(new AppError(`Could update items on cart. ${err}`, StatusCodes.BAD_REQUEST));
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const getUserCart = catchAsync(async (req, res, next) => {

    try {

        const user = await User.findById(req.user);

        const cart = await Cart.find({ user: user._id });

        if (cart) {
            res.status(StatusCodes.OK).json({
                status: "success",
                cart
            });
        }

        return next(new AppError(`Could not find user cart.`, StatusCodes.BAD_REQUEST));

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const getCartById = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        cart_id: Joi.string().required()
    });

    const { error } = schema.validate(req.params);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const { cart_id } = req.params;

        const cart = await Cart.findById(cart_id);

        if (cart) {
            res.status(StatusCodes.OK).json({
                status: "success",
                cart
            });
        }

        return next(new AppError(`Could not find cart.`, StatusCodes.BAD_REQUEST));

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const addToFavorites = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        product: Joi.string().required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const user = await User.findById(req.user);

        const { product } = req.body;

        const favorites = await Favorites.create({
            product, user: user._id
        });

        if (!favorites) {
            return next(new AppError(`Could not add items to favorites.`, StatusCodes.BAD_REQUEST));
        }

        res.status(StatusCodes.CREATED).json({
            status: "success",
            favorites
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const removeFavorite = catchAsync(async (req, res, next) => {

    const schema = Joi.object().keys({
        product: Joi.string().required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    try {

        const user = await User.findById(req.user);

        const { product } = req.body;

        await Favorites.findOneAndRemove({ product: product, user: user._id }, function (err, record) {
            if (!err) {
                res.status(StatusCodes.OK).json({
                    status: "success",
                    record
                });
            }
            return next(new AppError(`Could not remove product from wishlist.`, StatusCodes.BAD_REQUEST));
        });

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

const getUserFavorites = catchAsync(async (req, res, next) => {

    try {

        const user = await User.findById(req.user);

        const favorites = await Favorites.find({ user: user._id }).populate("product");

        if (favorites) {
            res.status(StatusCodes.OK).json({
                status: "success",
                favorites
            });
        }

        return next(new AppError(`Could not remove product from wishlist.`, StatusCodes.BAD_REQUEST));

    } catch (error) {
        return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
    }

});

module.exports = {
    prePurchaseAuth,
    postPurchaseAuth,
    prePurchase,
    postPurchase,
    addToCart,
    updateCart,
    clearCart,
    getUserCart,
    getCartById,
    addToFavorites,
    removeFavorite,
    getUserFavorites,
    addNewAddress,
    editUserAddress,
    myUserAddresses
};