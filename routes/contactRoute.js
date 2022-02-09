const express = require("express");
const contactMessage = require("../controllers/contactController");

const router = express.Router();

router.post("/", contactMessage);

module.exports = router;
