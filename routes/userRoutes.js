const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/signup").post(authController.signup);

router.post("/login", authController.login); 
router.route("/logout").delete(authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch("/updatePassword", authController.updatePassword);

router.route("/me").get(userController.getMe, userController.getUser);

// router.get("/myReferrals", userController.userReferrals);

router.patch("/updateMe", userController.updateMe);
router.patch("/updateDoc", userController.updateMe);
router.post("/deactivate", userController.deactivateMe);

//Authorization given only to Admins after this middleware.
router.use(authController.restrictTo("admin"));

router.route("/").get(userController.getAllUsers);
router.route("/role/admin/:id").patch(userController.setRoleToAdmin);
router.route("/role/user/:id").patch(userController.setRoleToUser);
router.route("/inactive").get(userController.getAllInactiveUsers);
router.route("/inactive/:id").get(userController.getInactiveUser);
router.post("/admin/activate/:id", userController.activateUser);
router.post("/admin/deactivate/:id", userController.deactivateUser);

router.get("/stats", userController.userStats);

// router.route("/:id").get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
