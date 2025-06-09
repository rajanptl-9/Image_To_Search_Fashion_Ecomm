const express = require("express");

const {
  checkout,
  paymentVerification,
} = require("../../controllers/shop/payment-controller");

const router = express.Router();

router.get("/checkout", checkout);
router.post('/payment-verification',paymentVerification);

module.exports = router;
