const express = require("express");
const multer = require('multer');

const {
  getFilteredProducts,
  getProductDetails,
  getProductsWithImage
} = require("../../controllers/shop/products-controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


router.get("/get", getFilteredProducts);
router.get("/get/:id", getProductDetails);
router.post("/get-similar-products", upload.single("image"), getProductsWithImage);

module.exports = router;
