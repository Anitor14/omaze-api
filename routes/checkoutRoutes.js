// const express = require("express");

// const {
//     postPurchase, postPurchaseAuth, prePurchase, prePurchaseAuth,
//     addToCart, updateCart, getUserCart, getCartById,
//     addToFavorites, removeFavorite, getUserFavorites,
//     addNewAddress, editUserAddress, myUserAddresses } = require("./../controllers/checkoutController");

// const { deleteModel } = require("../controllers/itemController");

// const authController = require("./../controllers/authController");

// const router = express.Router();

// router.route("/purchase").post(prePurchase).put(postPurchase);

// //protectedRoutes
// router.use(authController.protect);

// router.route("/items/delete/:model_id").delete(deleteModel);

// router.route("/user/address").post(addNewAddress).get(myUserAddresses);
// router.route("/user/address/:address_id").put(editUserAddress);

// router.route("/user/purchase").post(prePurchaseAuth).put(postPurchaseAuth);

// router.route("/user/cart").post(addToCart).put(updateCart).get(getUserCart);
// router.route("/user/cart/:cart_id").get(getCartById);

// router.route("/user/favorites").post(addToFavorites).delete(removeFavorite).get(getUserFavorites);

// module.exports = router;