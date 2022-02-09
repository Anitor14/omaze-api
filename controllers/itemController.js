const mongoose = require("mongoose");

const Product = require("../models/product.model");
const User = require("../models/user.model");

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const fs = require("fs");

const Joi = require("joi");
const { StatusCodes } = require("http-status-codes");

const { multiCloudinaryUpload } = require("../utils/cloudinary");
const {
  determineModel,
  updateImageToModel,
  determineUploadPath,
} = require("../utils/functions");

const addToImages = catchAsync(async (req, res, next) => {
  const schema = Joi.object().keys({
    imageableType: Joi.string().required(),
    imageableId: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(
      new AppError(
        `${error.details[0].message}`,
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  try {
    const { imageableType, imageableId } = req.body;

    const Model = determineModel(imageableType);

    const item = await Model.findById(imageableId);

    if (!item) {
      return next(
        new AppError(
          `Could not find ${imageableType} at this time, please contact administrator`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const initialPath = determineUploadPath(imageableType);

    const uploader = async (path) =>
      await multiCloudinaryUpload(path, `${initialPath}/${item._id}`);

    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      await updateImageToModel(Model, item._id, imageableType, newPath);
      fs.unlinkSync(path);
    }

    res.status(StatusCodes.CREATED).json({
      message: "Images added successfully",
      status: "success",
      product_variant: item,
    });
  } catch (error) {
    return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
  }
});


const createProduct = catchAsync(async (req, res, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    collections: Joi.string(),
    category: Joi.string(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    hasVariant: Joi.boolean().optional(),
    color: Joi.string().optional(),
    size: Joi.string().optional(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(
      new AppError(
        `${error.details[0].message}`,
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  try {
    const user = await User.findById(req.user);

    const { title, description, collections, category, price, quantity } =
      req.body;

    const defaultCollection = Collections.find({ isDefault: true });
    const defaultCategory = Category.find({ isDefault: true });

    const newProduct = await Product.create({
      title: title,
      description: description,
      collections: collections || defaultCollection._id,
      category: category || defaultCategory._id,
      price: price,
      quantity: quantity,
      user: user._id,
    });

    const initialPath = determineUploadPath("product");

    const uploader = async (path) =>
      await multiCloudinaryUpload(path, `${initialPath}/${newProduct._id}`);

    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);

      await updateImageToModel(Product, newProduct._id, "Product", newPath);

      fs.unlinkSync(path);
    }

    if (!newProduct) {
      return next(
        new AppError(
          `Could not add product at this time, please contact administrator`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    res.status(StatusCodes.CREATED).json({
      message: "Product Created successfully",
      status: "success",
      product: newProduct,
    });
  } catch (error) {
    return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
  }
});

const viewProducts = catchAsync(async (req, res, next) => {
  const { product_id } = req.params;

  try {
    let products = null;

    if (product_id) {
      products = await Product.findById(product_id)
        .populate("collections")
        .populate("category")
        .populate("images");
    } else {
      products = await Product.find()
        .populate("collections")
        .populate("category")
        .populate("images");
    }

    if (!products) {
      return next(
        new AppError(
          `Could not find product at this time, please contact administrator`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    res.status(StatusCodes.OK).json({
      message: "Product retrieved successfully",
      status: "success",
      products,
    });
  } catch (error) {
    return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
  }
});

const adminViewProducts = catchAsync(async (req, res, next) => {
  const { product_id } = req.params;

  try {
    let products = null;

    if (product_id) {
      products = await Product.findById(product_id)
        .populate("collections")
        .populate("category")
        .populate("user")
        .populate("images");
    } else {
      products = await Product.find()
        .populate("collections")
        .populate("category")
        .populate("user")
        .populate("images");
    }

    if (!products) {
      return next(
        new AppError(
          `Could not find product at this time, please contact administrator`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    res.status(StatusCodes.OK).json({
      message: "Product retrieved successfully",
      status: "success",
      products,
    });
  } catch (error) {
    return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
  }
});


const editProduct = catchAsync(async (req, res, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    collections: Joi.string(),
    category: Joi.string(),
    hasVariant: Joi.boolean().required(),
    variant: Joi.string(),
    price: Joi.number().required(),
    color: Joi.string(),
    size: Joi.number(),
    quantity: Joi.number().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(
      new AppError(
        `${error.details[0].message}`,
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  try {
    const {
      title,
      description,
      collections,
      category,
      hasVariant,
      variant,
      price,
      color,
      size,
      quantity,
    } = req.body;
    const { product_id } = req.params;

    const product = await Product.findOneAndUpdate(
      { _id: product_id },
      {
        title: title,
        description: description,
        collections: collections,
        category: category,
        hasVariant: hasVariant,
        variant: variant,
        price: price,
        color: color,
        size: size,
        quantity: quantity,
      },
      { new: true }
    );

    if (!product) {
      return next(
        new AppError(
          `Could not update product at this time.`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    res.status(StatusCodes.OK).json({
      message: "Product updated successfully",
      status: "success",
      product,
    });
  } catch (error) {
    return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
  }
});


const deleteModel = catchAsync(async (req, res, next) => {
  const schema = Joi.object().keys({
    model: Joi.string().required(),
    model_id: Joi.string(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(
      new AppError(
        `${error.details[0].message}`,
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  try {
    const { model } = req.body;
    const { model_id } = req.params;

    const modelName = determineModel(model);

    const modelDeleted = await modelName.findOneAndDelete({ _id: model_id });

    if (!modelDeleted) {
      return next(
        new AppError(
          `Could not delete ${model} with id ${model_id} at this time.`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    res.status(StatusCodes.OK).json({
      message: `${model} deleted successfully`,
      status: "success",
      modelDeleted,
    });
  } catch (error) {
    return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
  }
});

const deleteAll = catchAsync(async (req, res, next) => {
  const schema = Joi.object().keys({
    model: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(
      new AppError(
        `${error.details[0].message}`,
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  try {
    const { model } = req.body;

    const modelName = determineModel(model);

    const modelDeleted = await modelName.remove({});

    if (!modelDeleted) {
      return next(
        new AppError(
          `Could not delete ${model} at this time.`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    res.status(StatusCodes.OK).json({
      message: `${model} updated successfully`,
      status: "success",
      modelDeleted,
    });
  } catch (error) {
    return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
  }
});

module.exports = {
  createProduct,
  viewProducts,
  adminViewProducts,
  editProduct,
  deleteModel,
  deleteAll,
  addToImages,

};
