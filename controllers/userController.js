const User = require("../models/user.model");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const mongoose = require("mongoose");
// const Refferal = require("../models/re");

const filterObj = (obj, ...restrictedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (!restrictedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates. Please use /updateMyPassword.", 400));
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const updateData = filterObj(req.body, "email", "active", "role", "cron");

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deactivateMe = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  const user = await User.findById(req.user).select("+password");
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect password!.", 401));
  }
  await user.updateOne({ active: false });

  res.status(204).json({
    status: "success",
    data: null,
    message: "Account deactivated!",
  });
});

exports.deactivateUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("User does not exist!", 404));
  }
  await user.updateOne({ active: false });

  res.status(200).json({
    status: "success",
    data: null,
    message: "Account deactivated!",
  });
});

exports.activateUser = catchAsync(async (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  await User.updateOne({ _id: id }, { active: true });

  res.status(200).json({
    status: "success",
    data: null,
    message: "Account activated!",
  });
});

exports.userStats = catchAsync(async (req, res, next) => {
  const doc = await User.aggregate([
    {
      $group: {
        _id: "$active",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});

/* exports.userReferrals = catchAsync(async (req, res, next) => {

  const ref = await Refferal.find({ ref: req.user._id });
  res.status(200).json({
    status: "success",
    data: ref
  });

}); */

exports.getUser = factory.getOne(User);
exports.getInactiveUser = catchAsync(async (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const doc = await User.aggregate([
    {
      $match: { _id: id, active: { $ne: true } },
    },
  ]);

  if (doc.length < 1) {
    return next(new AppError("This user does not exist or is active!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});

exports.getAllInactiveUsers = catchAsync(async (req, res, next) => {
  const doc = await User.aggregate([
    {
      $match: { active: { $ne: true } },
    },
  ]);
  res.status(200).json({
    status: "success",
    result: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.setRoleToAdmin = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  await User.findByIdAndUpdate(id, { role: "admin" });
  res.status(200).json({
    status: "success",
    message: "User role set to admin",
  });
});

exports.setRoleToUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  await User.findByIdAndUpdate(id, { role: "user" });
  res.status(200).json({
    status: "success",
    message: "User role set to user",
  });
});

exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
