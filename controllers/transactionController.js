const mongoose = require("mongoose");
const Transaction = require("../models/transaction.model");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getMyTransactions = catchAsync(async (req, res, next) => {
  
  const doc = await Transaction.find({ user: mongoose.Types.ObjectId(req.user._id) });
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });

});

exports.getTransactionsByEmail = catchAsync(async (req, res, next) => {

  const { email } = req.params;

  const doc = await Transaction.findOne({ email: email });

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
});

// Admin Privilages
exports.getTransactions = catchAsync(async (req, res, next) => {
  const doc = await Transaction.find().populate("user");

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.getDepositTransactions = catchAsync(async (req, res, next) => {
  const doc = await Transaction.find({ type: "deposit" }).populate("user");

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.getWithdrawalTransactions = catchAsync(async (req, res, next) => {
  const doc = await Transaction.find({ type: "withdrawal" }).populate("user");

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.getOneTransaction = factory.getOne(Transaction, "user");

exports.deleteTransactions = factory.deleteOne(Transaction);
