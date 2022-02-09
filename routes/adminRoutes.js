const express = require("express");

const { adminViewCategories, adminViewCollections, adminViewProducts, 
    editCategory, editCollection, editProduct, 
    createCategory, createCollection, createProduct, deleteAll, deleteModel, 
    addProductVariant, editProductVariant, addToImages, viewProductVariants } = require("../controllers/itemController");

// const {  
//     createBanner, createBannerType, 
//     editBanner, editBannerType, 
//     viewBanner, viewBannerType 
// } = require("../controllers/adminController");

const { addProductImages, addCollectionImages, addCategoryImages } = require("../controllers/imagesController");

const authController = require("../controllers/authController");

require("dotenv").config();

// const multer = require('multer');
const multerUpload = require('../utils/multer');

/* const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file'); */

// const fileUpload = multer();

const router = express.Router();

//protectedRoutes
router.use(authController.protect);

router.use(authController.restrictTo("admin"));

router.route("/items/images").post(multerUpload.array("images", process.env.MAXIMUM_UPLOAD_COUNT), addToImages);

router.route("/product").get(adminViewProducts).post(multerUpload.array("images", process.env.MAXIMUM_UPLOAD_COUNT), createProduct);
router.route("/product/:product_id").get(adminViewProducts).put(editProduct);

router.route("/product/variant/:product_id").post(addProductVariant).get(viewProductVariants);
router.route("/product/variant/:variant_id").put(editProductVariant);

router.route("/collection").get(adminViewCollections).post(multerUpload.array("images", process.env.MAXIMUM_UPLOAD_COUNT), createCollection);
router.route("/collection/:collection_id").get(adminViewCollections).put(editCollection);

router.route("/category").get(adminViewCategories).post(multerUpload.array("images", process.env.MAXIMUM_UPLOAD_COUNT), createCategory);
router.route("/category/:category_id").get(adminViewCategories).put(editCategory);

router.route("/banners").get(viewBanner).post(multerUpload.array("images", process.env.MAXIMUM_UPLOAD_COUNT), createBanner);
router.route("/banners/:banner_id").get(viewBanner).put(editBanner);

router.route("/banner_type").get(viewBannerType).post(createBannerType);
router.route("/banner_type/:banner_type_id").get(viewBannerType).put(editBannerType);

router.route("/items/delete/:model_id").delete(deleteModel);
router.route("/items").delete(deleteAll);

module.exports = router;
