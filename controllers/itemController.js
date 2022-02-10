const mongoose = require("mongoose");
const Project = require("../models/Project.model");
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

const createProject = catchAsync(async (req, res, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
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

    const { title, description } = req.body;
    const newProject = await Project.create({
      title: title,
      description: description,
      user: user._id, 
    });

    const initialPath = determineUploadPath("project");

    const uploader = async (path) =>
      await multiCloudinaryUpload(path, `${initialPath}/${newProject._id}`);

    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);

      await updateImageToModel(Project, newProject._id, "project", newPath);

      fs.unlinkSync(path);
    }

    if (!newProject) {
      return next(
        new AppError(
          `Could not create project at this time, please contact administrator`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    res.status(StatusCodes.CREATED).json({
      message: "project Created successfully",
      status: "success",
      product: newProject,
    });
  } catch (error) {
    return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
  }
});

const viewProjects = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;

  try {
    let projects = null;

    if (project_id) {
      projects = await Project.findById(project_id).populate("images");
    } else {
      projects = await Project.find().populate("images");
    }

    if (!projects) {
      return next(
        new AppError(
          `Could not find project at this time, please contact administrator`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    res.status(StatusCodes.OK).json({
      message: "project retrieved successfully",
      status: "success",
      projects,
    });
  } catch (error) {
    return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
  }
});

const adminViewProjects = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;

  try {
    let projects = null;

    if (project_id) {
      projects = await Project.findById(project_id)
        .populate("user")
        .populate("images");
    } else {
      projects = await Project.find().populate("user").populate("images");
    }

    if (!projects) {
      return next(
        new AppError(
          `Could not find project at this time, please contact administrator`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    res.status(StatusCodes.OK).json({
      message: "project retrieved successfully",
      status: "success",
      projects,
    });
  } catch (error) {
    return next(new AppError(`${error}`, StatusCodes.INTERNAL_SERVER_ERROR));
  }
});

const editProject = catchAsync(async (req, res, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
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
    } = req.body;
    const { project_id } = req.params;

    const product = await Project.findOneAndUpdate(
      { _id: project_id },
      {
        title: title,
        description: description,
      },
      { new: true }
    );

    if (!product) {
      return next(
        new AppError(
          `Could not update project at this time.`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    res.status(StatusCodes.OK).json({
      message: "project updated successfully",
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
  createProject,
  viewProjects,
  adminViewProjects,
  editProject,
  deleteModel,
  deleteAll,
  addToImages,
};
