const express = require("express");

const {
  adminViewProjects,
  editProject,
  createProject,
  deleteAll,
  deleteModel,
  addToImages,
} = require("../controllers/itemController");

// const {
//   addProductImages,
//   addCollectionImages,
//   addCategoryImages,
// } = require("../controllers/imagesController");

const authController = require("../controllers/authController");

require("dotenv").config();

// const multer = require('multer');
const multerUpload = require("../utils/multer");

/* const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file'); */

// const fileUpload = multer();

const router = express.Router();

//protectedRoutes
router.use(authController.protect);

router.use(authController.restrictTo("admin"));

router
  .route("/items/images")
  .post(
    multerUpload.array("images", process.env.MAXIMUM_UPLOAD_COUNT),
    addToImages
  );

router
  .route("/project")
  .get(adminViewProjects)
  .post(
    multerUpload.array("images", process.env.MAXIMUM_UPLOAD_COUNT),
    createProject
  );
router.route("/project/:project_id").get(adminViewProjects).put(editProject);

router.route("/items/delete/:model_id").delete(deleteModel);
router.route("/items").delete(deleteAll);

module.exports = router;
