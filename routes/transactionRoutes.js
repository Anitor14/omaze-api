const express = require("express");
const transactionController = require("./../controllers/transactionController");
const authController = require("./../controllers/authController");

const router = express.Router();

//protectedRoutes
router.use(authController.protect);

router.route("/my-transactions").get(transactionController.getMyTransactions);

router.use(authController.restrictTo("admin"));

router.post("/withdrawal/approve/:id", transactionController.approveWithdrawal);
router.post("/withdrawal/decline/:id", transactionController.declineWithdrawal);

router.post("/deposit/approve/:id", transactionController.approveDeposit);
router.post("/deposit/decline/:id", transactionController.declineDeposit);
router.get("/admin/stats", transactionController.transactionStats);
router.get("/all", transactionController.getTransactions);
router.get("/all/deposit", transactionController.getDepositTransactions);
router.get("/all/withdrawal", transactionController.getWithdrawalTransactions);
router.route("/:id").get(transactionController.getOneTransaction).delete(transactionController.deleteTransactions);

module.exports = router;
